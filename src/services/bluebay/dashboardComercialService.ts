
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { fetchInBatches } from "./utils/batchFetchUtils";
import { processarDadosFaturamento } from "./utils/faturamentoDataUtils";
import { DashboardComercialData, FaturamentoItem, PedidoItem } from "./dashboardComercialTypes";

/**
 * Busca dados de faturamento para o dashboard comercial
 * Versão otimizada utilizando view materializada para melhor performance
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
    
    // Usar a view materializada para buscar os dados
    const formattedStartDate = `${startDateStr}T00:00:00.000`;
    const formattedEndDate = `${endDateStr}T23:59:59.999`;
    
    // Buscar dados da view materializada
    const { data: faturamentoData, error: faturamentoError } = await supabase
      .from('mv_faturamento_resumido')
      .select('*')
      .gte('DATA_EMISSAO', formattedStartDate)
      .lte('DATA_EMISSAO', formattedEndDate);
    
    if (faturamentoError) {
      console.error('Erro ao buscar dados da view materializada:', faturamentoError);
      throw faturamentoError;
    }

    // Converter os dados da view para o formato esperado
    const faturamentoItems = faturamentoData || [];

    console.log(`Total de registros recuperados da view materializada: ${faturamentoItems.length}`);

    // Para compatibilidade, simulamos pedidoItems com dados das vendas já faturadas
    // Na view materializada já temos os dados consolidados
    const pedidoItems = faturamentoItems.map((item: any) => ({
      ...item,
      QTDE_PEDIDA: item.QUANTIDADE || 0,
      QTDE_ENTREGUE: item.QUANTIDADE || 0,
      QTDE_SALDO: 0,
      DATA_PEDIDO: item.DATA_EMISSAO
    })) as PedidoItem[];

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
      faturamentoItems: faturamentoItems as FaturamentoItem[],
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
