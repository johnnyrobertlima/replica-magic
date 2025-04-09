
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { fetchInBatches } from "./utils/batchFetchUtils";
import { processarDadosFaturamento } from "./utils/faturamentoDataUtils";
import { DashboardComercialData, FaturamentoItem, PedidoItem } from "./dashboardComercialTypes";

/**
 * Busca dados de faturamento para o dashboard comercial
 * Versão otimizada para trabalhar com a view materializada sem depender de foreign keys
 */
export const fetchDashboardComercialData = async (
  startDate: Date | null,
  endDate: Date | null
): Promise<DashboardComercialData> => {
  try {
    // Converte as datas para strings no formato SQL
    const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    console.log(`Buscando dados de faturamento comercial de ${startDateStr} até ${endDateStr}`);
    
    // Formatar datas para consulta
    const formattedStartDate = `${startDateStr}T00:00:00.000`;
    const formattedEndDate = `${endDateStr}T23:59:59.999`;
    
    // 1. Primeiro buscar dados da view materializada de forma simples (sem joins)
    const { data: faturamentoDataFromView, error: faturamentoViewError } = await supabase
      .from('mv_faturamento_resumido')
      .select('*')
      .gte('DATA_EMISSAO', formattedStartDate)
      .lte('DATA_EMISSAO', formattedEndDate);
    
    if (faturamentoViewError) {
      console.error('Erro ao buscar dados da view materializada:', faturamentoViewError);
      throw faturamentoViewError;
    }

    // 2. Buscar dados adicionais das tabelas relacionadas
    // Extrair os números de pedidos e anos base para buscar dados detalhados
    const pedidosKeys = faturamentoDataFromView?.map(item => ({
      PED_NUMPEDIDO: item.PED_NUMPEDIDO,
      PED_ANOBASE: item.PED_ANOBASE,
    })) || [];

    // Remover duplicatas
    const uniquePedidosKeys = pedidosKeys.filter((item, index, self) =>
      index === self.findIndex(t => (
        t.PED_NUMPEDIDO === item.PED_NUMPEDIDO && t.PED_ANOBASE === item.PED_ANOBASE
      ))
    );

    // Buscar dados detalhados dos pedidos
    const { data: pedidosData, error: pedidosError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .in('PED_NUMPEDIDO', uniquePedidosKeys.map(k => k.PED_NUMPEDIDO).filter(Boolean));

    if (pedidosError) {
      console.error('Erro ao buscar dados detalhados dos pedidos:', pedidosError);
      // Não vamos interromper o fluxo, mas logar o erro
    }

    // Buscar dados das notas fiscais
    // Extrair as notas para buscar os detalhes
    const notasKeys = faturamentoDataFromView?.map(item => item.NOTA).filter(Boolean) || [];
    
    console.log(`Buscando dados de ${notasKeys.length} notas fiscais`);
    
    const { data: faturamentoData, error: faturamentoError } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .in('NOTA', notasKeys);

    if (faturamentoError) {
      console.error('Erro ao buscar dados das notas fiscais:', faturamentoError);
      // Não vamos interromper o fluxo, mas logar o erro
    } else {
      console.log(`Encontradas ${faturamentoData?.length || 0} linhas de faturamento nas notas solicitadas`);
    }

    // 3. Combinar os dados para criar o resultado final
    // Criar mapa de pedidos para rápido acesso
    const pedidosMap = new Map();
    pedidosData?.forEach(pedido => {
      const key = `${pedido.PED_NUMPEDIDO}-${pedido.PED_ANOBASE}`;
      pedidosMap.set(key, pedido);
    });

    // Criar mapa de faturamento para rápido acesso agrupado por nota
    const faturamentoMap = new Map();
    faturamentoData?.forEach(fatura => {
      if (!fatura.NOTA) return;
      
      // Se já existe uma entrada para esta nota, adiciona a este item
      if (faturamentoMap.has(fatura.NOTA)) {
        faturamentoMap.get(fatura.NOTA).push(fatura);
      } else {
        // Caso contrário, cria um novo array com este item
        faturamentoMap.set(fatura.NOTA, [fatura]);
      }
    });

    console.log(`Processando ${faturamentoDataFromView?.length || 0} itens da view...`);
    console.log(`Mapas: ${pedidosMap.size} pedidos e ${faturamentoMap.size} notas de faturamento`);

    // Combinar os dados da view com os dados detalhados
    const faturamentoItems: FaturamentoItem[] = faturamentoDataFromView?.map(viewItem => {
      // Buscar dados do pedido correspondente
      const pedidoKey = `${viewItem.PED_NUMPEDIDO}-${viewItem.PED_ANOBASE}`;
      const pedidoDetalhe = pedidosMap.get(pedidoKey);
      
      // Buscar dados da nota fiscal correspondente
      const faturasDetalhe = viewItem.NOTA ? faturamentoMap.get(viewItem.NOTA) || [] : [];
      
      // Se tiver mais de uma linha de faturamento para esta nota, encontre a correspondente
      // ao item atual usando outros campos como ITEM_CODIGO ou PED_NUMPEDIDO
      let faturaDetalhe = null;
      if (faturasDetalhe.length > 0) {
        if (faturasDetalhe.length === 1) {
          // Se só tem uma linha, usa ela
          faturaDetalhe = faturasDetalhe[0];
        } else {
          // Tenta encontrar a linha específica para este item usando os campos disponíveis
          // Verificamos se temos os campos necessários para o matching
          const hasItemCodigo = 'ITEM_CODIGO' in viewItem;
          
          faturaDetalhe = faturasDetalhe.find(f => 
            (hasItemCodigo && viewItem.ITEM_CODIGO && f.ITEM_CODIGO === viewItem.ITEM_CODIGO) || 
            (f.PED_NUMPEDIDO === viewItem.PED_NUMPEDIDO &&
            f.PED_ANOBASE === viewItem.PED_ANOBASE)
          ) || faturasDetalhe[0]; // Se não encontrar, usa a primeira
        }
      }

      // Combinar dados
      return {
        ...viewItem,
        // Adicionar campos do pedido
        pedido: pedidoDetalhe ? {
          CENTROCUSTO: pedidoDetalhe.CENTROCUSTO,
          MATRIZ: pedidoDetalhe.MATRIZ,
          FILIAL: pedidoDetalhe.FILIAL,
          PED_NUMPEDIDO: pedidoDetalhe.PED_NUMPEDIDO,
          PED_ANOBASE: pedidoDetalhe.PED_ANOBASE,
          MPED_NUMORDEM: pedidoDetalhe.MPED_NUMORDEM,
          ITEM_CODIGO: pedidoDetalhe.ITEM_CODIGO,
          PES_CODIGO: pedidoDetalhe.PES_CODIGO,
          QTDE_PEDIDA: pedidoDetalhe.QTDE_PEDIDA,
          QTDE_ENTREGUE: pedidoDetalhe.QTDE_ENTREGUE,
          QTDE_SALDO: pedidoDetalhe.QTDE_SALDO,
          STATUS: pedidoDetalhe.STATUS,
          DATA_PEDIDO: pedidoDetalhe.DATA_PEDIDO,
          VALOR_UNITARIO: pedidoDetalhe.VALOR_UNITARIO,
          REPRESENTANTE: pedidoDetalhe.REPRESENTANTE
        } : undefined,
        // Adicionar campos de faturamento
        faturamento: faturaDetalhe ? {
          NOTA: faturaDetalhe.NOTA,
          MATRIZ: faturaDetalhe.MATRIZ,
          FILIAL: faturaDetalhe.FILIAL,
          ID_EF_DOCFISCAL: faturaDetalhe.ID_EF_DOCFISCAL,
          ID_EF_DOCFISCAL_ITEM: faturaDetalhe.ID_EF_DOCFISCAL_ITEM,
          PED_NUMPEDIDO: faturaDetalhe.PED_NUMPEDIDO,
          PED_ANOBASE: faturaDetalhe.PED_ANOBASE,
          MPED_NUMORDEM: faturaDetalhe.MPED_NUMORDEM,
          ITEM_CODIGO: faturaDetalhe.ITEM_CODIGO,
          QUANTIDADE: faturaDetalhe.QUANTIDADE,
          VALOR_UNITARIO: faturaDetalhe.VALOR_UNITARIO,
          VALOR_DESCONTO: faturaDetalhe.VALOR_DESCONTO,
          VALOR_NOTA: faturaDetalhe.VALOR_NOTA,
          STATUS: faturaDetalhe.STATUS,
          DATA_EMISSAO: faturaDetalhe.DATA_EMISSAO,
          PES_CODIGO: faturaDetalhe.PES_CODIGO,
          TIPO: faturaDetalhe.TIPO
        } : undefined
      };
    }) || [];

    console.log(`Total de registros recuperados com relacionamentos manuais: ${faturamentoItems.length}`);

    // Log para debug - verificar quais itens possuem dados de faturamento
    const itemsWithFaturamento = faturamentoItems.filter(item => item.faturamento).length;
    console.log(`Itens com dados de faturamento: ${itemsWithFaturamento} (${(itemsWithFaturamento / faturamentoItems.length * 100).toFixed(2)}%)`);

    // Extrair dados de pedidos a partir dos dados do faturamento
    const pedidoItems = faturamentoItems
      .filter(item => item.pedido) // Filtrar apenas itens que têm dados de pedido
      .map((item) => {
        return {
          MATRIZ: item.pedido?.MATRIZ || item.MATRIZ,
          FILIAL: item.pedido?.FILIAL || item.FILIAL,
          PED_NUMPEDIDO: item.pedido?.PED_NUMPEDIDO || item.PED_NUMPEDIDO,
          PED_ANOBASE: item.pedido?.PED_ANOBASE || item.PED_ANOBASE,
          MPED_NUMORDEM: item.pedido?.MPED_NUMORDEM || item.MPED_NUMORDEM,
          ITEM_CODIGO: item.pedido?.ITEM_CODIGO || item.ITEM_CODIGO,
          PES_CODIGO: item.pedido?.PES_CODIGO || item.PES_CODIGO,
          QTDE_PEDIDA: item.pedido?.QTDE_PEDIDA || item.QUANTIDADE,
          QTDE_ENTREGUE: item.pedido?.QTDE_ENTREGUE || item.QUANTIDADE,
          QTDE_SALDO: item.pedido?.QTDE_SALDO || 0,
          DATA_PEDIDO: item.pedido?.DATA_PEDIDO || item.DATA_PEDIDO || item.DATA_EMISSAO,
          STATUS: item.pedido?.STATUS || item.STATUS,
          VALOR_UNITARIO: item.pedido?.VALOR_UNITARIO || item.VALOR_UNITARIO,
          CENTROCUSTO: item.pedido?.CENTROCUSTO || item.CENTROCUSTO || item.CENTRO_CUSTO
        };
      }) as PedidoItem[];

    // Processar os dados de faturamento para gerar os agregados
    const {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      minDate,
      maxDate
    } = processarDadosFaturamento(faturamentoItems, pedidoItems);

    // Considerar dados completos se houver pelo menos algum dado
    const hasCompleteData = faturamentoItems.length > 0;

    // Retornar os dados processados
    const returnData: DashboardComercialData = {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      faturamentoItems,
      pedidoItems,
      dataRangeInfo: {
        startDateRequested: startDateStr,
        endDateRequested: endDateStr,
        startDateActual: minDate ? format(minDate, 'yyyy-MM-dd') : null,
        endDateActual: maxDate ? format(maxDate, 'yyyy-MM-dd') : null,
        hasCompleteData
      }
    };

    return returnData;
  } catch (error) {
    console.error('Erro ao buscar dados de dashboard comercial:', error);
    throw error;
  }
};
