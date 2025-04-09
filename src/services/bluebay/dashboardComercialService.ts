
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { fetchInBatches } from "./utils/batchFetchUtils";
import { processarDadosFaturamento } from "./utils/faturamentoDataUtils";
import { DashboardComercialData, FaturamentoItem, PedidoItem } from "./dashboardComercialTypes";

/**
 * Busca dados de faturamento para o dashboard comercial
 * Versão otimizada que consulta pedidos e faturamento de forma independente
 * exceto quando houver filtro de centro de custo
 */
export const fetchDashboardComercialData = async (
  startDate: Date | null,
  endDate: Date | null,
  centroCusto?: string | null
): Promise<DashboardComercialData> => {
  try {
    // Converte as datas para strings no formato SQL
    const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    console.log(`Buscando dados de dashboard comercial de ${startDateStr} até ${endDateStr}`);
    if (centroCusto) {
      console.log(`Filtrando por centro de custo: ${centroCusto}`);
    }
    
    // Formatar datas para consulta
    const formattedStartDate = `${startDateStr}T00:00:00.000`;
    const formattedEndDate = `${endDateStr}T23:59:59.999`;
    
    let faturamentoItems: FaturamentoItem[] = [];
    let pedidoItems: PedidoItem[] = [];

    // Caso 1: Se houver filtro de centro de custo, fazemos o join entre as tabelas
    if (centroCusto) {
      console.log("Realizando consulta com JOIN entre FATURAMENTO e PEDIDO devido ao filtro de centro de custo");
      
      // Buscar dados de faturamento com join em pedido para filtrar por centro de custo
      const { data: joinedData, error: joinError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select(`
          *,
          pedido:BLUEBAY_PEDIDO!inner(
            MATRIZ,
            FILIAL,
            PED_NUMPEDIDO,
            PED_ANOBASE,
            MPED_NUMORDEM,
            ITEM_CODIGO,
            PES_CODIGO,
            QTDE_PEDIDA,
            QTDE_ENTREGUE,
            QTDE_SALDO,
            STATUS,
            DATA_PEDIDO,
            VALOR_UNITARIO,
            CENTROCUSTO,
            REPRESENTANTE
          )
        `)
        .eq('pedido.CENTROCUSTO', centroCusto)
        .gte('DATA_EMISSAO', formattedStartDate)
        .lte('DATA_EMISSAO', formattedEndDate);

      if (joinError) {
        console.error('Erro na consulta com join:', joinError);
        throw joinError;
      }

      // Transformar os dados do join no formato esperado
      faturamentoItems = joinedData?.map(item => ({
        ...item,
        CENTROCUSTO: item.pedido?.CENTROCUSTO,
        // Incluir outros campos necessários do pedido
        DATA_PEDIDO: item.pedido?.DATA_PEDIDO,
        REPRESENTANTE: item.pedido?.REPRESENTANTE
      })) || [];

      // Extrair os dados de pedidos a partir do join
      pedidoItems = joinedData?.map(item => ({
        MATRIZ: item.pedido.MATRIZ,
        FILIAL: item.pedido.FILIAL,
        PED_NUMPEDIDO: item.pedido.PED_NUMPEDIDO,
        PED_ANOBASE: item.pedido.PED_ANOBASE,
        MPED_NUMORDEM: item.pedido.MPED_NUMORDEM,
        ITEM_CODIGO: item.pedido.ITEM_CODIGO,
        PES_CODIGO: item.pedido.PES_CODIGO,
        QTDE_PEDIDA: item.pedido.QTDE_PEDIDA,
        QTDE_ENTREGUE: item.pedido.QTDE_ENTREGUE,
        QTDE_SALDO: item.pedido.QTDE_SALDO,
        DATA_PEDIDO: item.pedido.DATA_PEDIDO,
        STATUS: item.pedido.STATUS,
        VALOR_UNITARIO: item.pedido.VALOR_UNITARIO,
        CENTROCUSTO: item.pedido.CENTROCUSTO
      })) || [];
    } 
    // Caso 2: Sem filtro de centro de custo, consultamos as tabelas independentemente
    else {
      console.log("Realizando consultas independentes para FATURAMENTO e PEDIDO");
      
      // 1. Buscar dados de faturamento de forma independente
      const { data: faturamentoData, error: faturamentoError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*')
        .gte('DATA_EMISSAO', formattedStartDate)
        .lte('DATA_EMISSAO', formattedEndDate);
      
      if (faturamentoError) {
        console.error('Erro ao buscar dados de faturamento:', faturamentoError);
        throw faturamentoError;
      }

      faturamentoItems = faturamentoData || [];
      console.log(`Encontrados ${faturamentoItems.length} registros de faturamento`);

      // 2. Buscar dados de pedidos de forma independente
      const { data: pedidosData, error: pedidosError } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .gte('DATA_PEDIDO', formattedStartDate)
        .lte('DATA_PEDIDO', formattedEndDate);
      
      if (pedidosError) {
        console.error('Erro ao buscar dados de pedidos:', pedidosError);
        throw pedidosError;
      }

      pedidoItems = pedidosData || [];
      console.log(`Encontrados ${pedidoItems.length} registros de pedidos`);
    }

    console.log(`Total de registros recuperados: ${faturamentoItems.length} faturamentos e ${pedidoItems.length} pedidos`);

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
    const hasCompleteData = faturamentoItems.length > 0 || pedidoItems.length > 0;

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
