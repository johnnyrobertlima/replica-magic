
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { fetchInBatches } from "./utils/batchFetchUtils";
import { processarDadosFaturamento } from "./utils/faturamentoDataUtils";
import { DashboardComercialData, FaturamentoItem, PedidoItem } from "./dashboardComercialTypes";

/**
 * Busca dados de faturamento para o dashboard comercial
 * Versão otimizada para garantir que todos os dados do período sejam recuperados
 * e evitar consultas desnecessárias
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
    
    // Adaptar o tamanho do lote conforme a quantidade de dados
    const batchSize = 2000; // Otimizado para melhor desempenho
    
    // Função para buscar dados de faturamento em lotes com query otimizada
    const fetchFaturamentoBatch = async (offset: number, limit: number) => {
      console.log(`Buscando lote de faturamento ${offset/limit + 1} (tamanho: ${limit})`);
      const query = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*', { count: 'exact', head: false })
        .eq('TIPO', 'S') // Somente dados de vendas
        .neq('STATUS', '4') // Excluir notas canceladas (STATUS = 4)
        .gte('DATA_EMISSAO', `${startDateStr}T00:00:00.000`)
        .lte('DATA_EMISSAO', `${endDateStr}T23:59:59.999`)
        .range(offset, offset + limit - 1);
      
      const result = await query;
      console.log(`Lote de faturamento ${offset/limit + 1}: ${result.data?.length || 0} registros`);
      return result;
    };
    
    // Função para buscar dados de pedidos em lotes com query otimizada
    const fetchPedidoBatch = async (offset: number, limit: number) => {
      console.log(`Buscando lote de pedidos ${offset/limit + 1} (tamanho: ${limit})`);
      
      const query = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*', { count: 'exact', head: false })
        // Agora busca todos os pedidos independente da marca (CENTROCUSTO)
        .gte('DATA_PEDIDO', `${startDateStr}T00:00:00.000`)
        .lte('DATA_PEDIDO', `${endDateStr}T23:59:59.999`)
        .range(offset, offset + limit - 1);
      
      const result = await query;
      console.log(`Lote de pedidos ${offset/limit + 1}: ${result.data?.length || 0} registros`);
      return result;
    };
    
    // Buscar todos os dados de faturamento e pedidos usando o utilitário de lotes
    const [faturamentoData, pedidoData] = await Promise.all([
      fetchInBatches<FaturamentoItem>(fetchFaturamentoBatch, batchSize),
      fetchInBatches<PedidoItem>(fetchPedidoBatch, batchSize)
    ]);
    
    const faturamentoTotal = faturamentoData?.length || 0;
    const pedidoTotal = pedidoData?.length || 0;
    
    console.log(`Total de registros de faturamento recuperados: ${faturamentoTotal}`);
    console.log(`Total de registros de pedidos recuperados: ${pedidoTotal}`);

    // Diagnóstico das datas - log apenas se houver dados
    if (faturamentoData.length > 0) {
      try {
        const minFaturamentoDate = new Date(Math.min(...faturamentoData
          .filter(f => f.DATA_EMISSAO) // Filtrar itens sem DATA_EMISSAO
          .map(f => new Date(f.DATA_EMISSAO || 0).getTime())));
        const maxFaturamentoDate = new Date(Math.max(...faturamentoData
          .filter(f => f.DATA_EMISSAO) // Filtrar itens sem DATA_EMISSAO
          .map(f => new Date(f.DATA_EMISSAO || 0).getTime())));
        
        console.log(`Intervalo de datas no faturamento: ${format(minFaturamentoDate, 'yyyy-MM-dd')} até ${format(maxFaturamentoDate, 'yyyy-MM-dd')}`);
        
        // Verificar se há datas fora do intervalo solicitado - primeiro verificar se há problemas
        const itensForaDoIntervalo = faturamentoData.filter(item => {
          if (!item.DATA_EMISSAO) return false;
          const dataEmissao = new Date(item.DATA_EMISSAO);
          return dataEmissao < new Date(`${startDateStr}T00:00:00.000`) || 
                 dataEmissao > new Date(`${endDateStr}T23:59:59.999`);
        });
        
        // Só logar se houver problemas, para evitar logs desnecessários
        if (itensForaDoIntervalo.length > 0) {
          console.warn(`ATENÇÃO: ${itensForaDoIntervalo.length} registros de faturamento estão fora do intervalo de datas solicitado!`);
          if (itensForaDoIntervalo.length > 0 && itensForaDoIntervalo.length <= 10) {
            console.warn('Registros fora do intervalo:', itensForaDoIntervalo);
          } else {
            console.warn('Primeiros 5 registros fora do intervalo:', itensForaDoIntervalo.slice(0, 5).map(f => ({ 
              NOTA: f.NOTA, 
              DATA_EMISSAO: f.DATA_EMISSAO 
            })));
          }
        }
      } catch (e) {
        console.error('Erro ao calcular intervalo de datas:', e);
      }
    }

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

    // Considerar dados completos se houver pelo menos algum dado
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
