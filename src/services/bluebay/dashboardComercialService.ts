
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { fetchInBatches } from "./utils/batchFetchUtils";
import { processarDadosFaturamento } from "./utils/faturamentoDataUtils";
import { DashboardComercialData, FaturamentoItem, PedidoItem } from "./dashboardComercialTypes";

/**
 * Busca dados de faturamento para o dashboard comercial
 * Versão otimizada utilizando view materializada e relacionamentos com tabelas originais
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
    
    // Buscar dados da view materializada com join nas tabelas relacionadas
    const { data: faturamentoData, error: faturamentoError } = await supabase
      .from('mv_faturamento_resumido')
      .select(`
        *,
        pedido:BLUEBAY_PEDIDO!inner(
          CENTROCUSTO,
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
          REPRESENTANTE
        ),
        faturamento:BLUEBAY_FATURAMENTO(
          NOTA,
          MATRIZ,
          FILIAL,
          ID_EF_DOCFISCAL,
          ID_EF_DOCFISCAL_ITEM,
          PED_NUMPEDIDO,
          PED_ANOBASE,
          MPED_NUMORDEM,
          ITEM_CODIGO,
          QUANTIDADE,
          VALOR_UNITARIO,
          VALOR_DESCONTO,
          VALOR_NOTA,
          STATUS,
          DATA_EMISSAO,
          PES_CODIGO,
          TIPO
        )
      `)
      .gte('DATA_EMISSAO', formattedStartDate)
      .lte('DATA_EMISSAO', formattedEndDate);
    
    if (faturamentoError) {
      console.error('Erro ao buscar dados da view com relacionamentos:', faturamentoError);
      throw faturamentoError;
    }

    // Processar dados para o formato esperado
    const faturamentoItems: FaturamentoItem[] = faturamentoData?.map((item: any) => {
      // Combinar dados da view com os dados do faturamento
      return {
        // Campos da view materializada
        ...item,
        // Adicionar campos da tabela BLUEBAY_FATURAMENTO se disponíveis
        MATRIZ: item.faturamento?.MATRIZ || item.MATRIZ || item.pedido?.MATRIZ,
        FILIAL: item.faturamento?.FILIAL || item.FILIAL || item.pedido?.FILIAL,
        ID_EF_DOCFISCAL: item.faturamento?.ID_EF_DOCFISCAL || item.ID_EF_DOCFISCAL,
        ID_EF_DOCFISCAL_ITEM: item.faturamento?.ID_EF_DOCFISCAL_ITEM || item.ID_EF_DOCFISCAL_ITEM,
        ITEM_CODIGO: item.faturamento?.ITEM_CODIGO || item.ITEM_CODIGO || item.pedido?.ITEM_CODIGO,
        QUANTIDADE: item.faturamento?.QUANTIDADE || item.QUANTIDADE,
        VALOR_UNITARIO: item.faturamento?.VALOR_UNITARIO || item.VALOR_UNITARIO || item.pedido?.VALOR_UNITARIO,
        VALOR_DESCONTO: item.faturamento?.VALOR_DESCONTO || item.VALOR_DESCONTO,
        VALOR_NOTA: item.faturamento?.VALOR_NOTA || item.VALOR_NOTA,
        STATUS: item.faturamento?.STATUS || item.STATUS || item.pedido?.STATUS,
        PES_CODIGO: item.faturamento?.PES_CODIGO || item.PES_CODIGO || item.pedido?.PES_CODIGO,
        // Garantir que CENTROCUSTO está disponível
        CENTROCUSTO: item.CENTROCUSTO || item.CENTRO_CUSTO || item.pedido?.CENTROCUSTO
      };
    }) || [];

    console.log(`Total de registros recuperados com relacionamentos: ${faturamentoItems.length}`);

    // Extrair dados de pedidos a partir dos dados do faturamento
    const pedidoItems = faturamentoData?.map((item: any) => {
      return {
        MATRIZ: item.pedido?.MATRIZ || item.MATRIZ,
        FILIAL: item.pedido?.FILIAL || item.FILIAL,
        PED_NUMPEDIDO: item.pedido?.PED_NUMPEDIDO || item.PED_NUMPEDIDO,
        PED_ANOBASE: item.pedido?.PED_ANOBASE || item.PED_ANOBASE,
        MPED_NUMORDEM: item.pedido?.MPED_NUMORDEM || item.MPED_NUMORDEM,
        ITEM_CODIGO: item.pedido?.ITEM_CODIGO || item.ITEM_CODIGO,
        PES_CODIGO: item.pedido?.PES_CODIGO || item.PES_CODIGO,
        QTDE_PEDIDA: item.pedido?.QTDE_PEDIDA || item.QTDE_PEDIDA || item.QUANTIDADE,
        QTDE_ENTREGUE: item.pedido?.QTDE_ENTREGUE || item.QTDE_ENTREGUE,
        QTDE_SALDO: item.pedido?.QTDE_SALDO || item.QTDE_SALDO || 0,
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
