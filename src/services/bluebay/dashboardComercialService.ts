
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { fetchInBatches } from "./utils/batchFetchUtils";
import { processarDadosFaturamento } from "./utils/faturamentoDataUtils";
import { DashboardComercialData, FaturamentoItem, PedidoItem } from "./dashboardComercialTypes";

/**
 * Busca dados de faturamento para o dashboard comercial
 * Versão otimizada para garantir que todos os dados do período sejam recuperados
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
    
    // Função para buscar dados de faturamento em lotes
    const fetchFaturamentoBatch = async (offset: number, limit: number) => {
      const query = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*', { count: 'exact', head: false })
        .eq('TIPO', 'S') // Somente dados de vendas
        .gte('DATA_EMISSAO', startDateStr)
        .lte('DATA_EMISSAO', `${endDateStr}T23:59:59.999`)
        .range(offset, offset + limit - 1);
      
      return await query;
    };
    
    // Função para buscar dados de pedidos em lotes
    const fetchPedidoBatch = async (offset: number, limit: number) => {
      const query = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*', { count: 'exact', head: false })
        .eq('CENTROCUSTO', 'BLUEBAY') // Filtrar apenas pedidos da BLUEBAY
        .in('STATUS', ['1', '2', '3']) // Pedidos em aberto, parciais ou concluídos
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', `${endDateStr}T23:59:59.999`)
        .range(offset, offset + limit - 1);
      
      return await query;
    };
    
    // Buscar todos os dados de faturamento e pedidos usando o utilitário de lotes
    const [faturamentoData, pedidoData] = await Promise.all([
      fetchInBatches<FaturamentoItem>(fetchFaturamentoBatch, 1000),
      fetchInBatches<PedidoItem>(fetchPedidoBatch, 1000)
    ]);
    
    console.log(`Total de registros de faturamento recuperados: ${faturamentoData?.length || 0}`);
    console.log(`Total de registros de pedidos recuperados: ${pedidoData?.length || 0}`);

    // Processar os dados de faturamento usando o utilitário de processamento
    const {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      minDate,
      maxDate
    } = processarDadosFaturamento(faturamentoData, pedidoData);

    // Verificar se os dados cobrem todo o período solicitado
    // Consideramos que temos dados completos se temos pelo menos algum dado 
    const hasCompleteData = faturamentoData.length > 0;

    // Retornar os dados processados, incluindo os itens originais para a tabela
    const returnData: DashboardComercialData = {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      faturamentoItems: faturamentoData,
      pedidoItems: pedidoData,
      dataRangeInfo: {
        startDateRequested: startDateStr,
        endDateRequested: endDateStr,
        startDateActual: minDate ? format(minDate, 'yyyy-MM-dd') : null,
        endDateActual: maxDate ? format(maxDate, 'yyyy-MM-dd') : null,
        hasCompleteData
      }
    };

    console.log(`Processamento concluído: ${dailyFaturamento.length} dias, ${monthlyFaturamento.length} meses`);
    return returnData;
  } catch (error) {
    console.error('Erro ao buscar dados de dashboard comercial:', error);
    throw error;
  }
};
