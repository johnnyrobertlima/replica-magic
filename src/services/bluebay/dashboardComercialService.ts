
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
    
    // Adaptar o tamanho do lote para melhor equilíbrio entre performance e memória
    const batchSize = 5000; // Otimizado para não sobrecarregar
    
    // Função para buscar dados de faturamento em lotes com query otimizada
    const fetchFaturamentoBatch = async (offset: number, limit: number) => {
      console.log(`Buscando lote de faturamento ${offset/limit + 1} (tamanho: ${limit})`);
      
      // Garantir que as datas estejam formatadas corretamente
      const formattedStartDate = `${startDateStr}T00:00:00.000`;
      const formattedEndDate = `${endDateStr}T23:59:59.999`;
      
      const query = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*', { count: 'exact', head: false })
        .eq('TIPO', 'S') // Somente dados de vendas
        .neq('STATUS', '4') // Excluir notas canceladas (STATUS = 4)
        .gte('DATA_EMISSAO', formattedStartDate)
        .lte('DATA_EMISSAO', formattedEndDate)
        .range(offset, offset + limit - 1);
      
      const result = await query;
      console.log(`Lote de faturamento ${offset/limit + 1}: ${result.data?.length || 0} registros`);
      return result;
    };
    
    // Função para buscar dados de pedidos em lotes com query otimizada
    const fetchPedidoBatch = async (offset: number, limit: number) => {
      console.log(`Buscando lote de pedidos ${offset/limit + 1} (tamanho: ${limit})`);
      
      // Garantir que as datas estejam formatadas corretamente
      const formattedStartDate = `${startDateStr}T00:00:00.000`;
      const formattedEndDate = `${endDateStr}T23:59:59.999`;
      
      const query = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*', { count: 'exact', head: false })
        // Busca pedidos dentro do intervalo de datas especificado
        .gte('DATA_PEDIDO', formattedStartDate)
        .lte('DATA_PEDIDO', formattedEndDate)
        .range(offset, offset + limit - 1);
      
      const result = await query;
      console.log(`Lote de pedidos ${offset/limit + 1}: ${result.data?.length || 0} registros`);
      return result;
    };
    
    // Buscar dados com timeout para evitar bloqueios
    const timeoutPromise = new Promise<any>((_, reject) => {
      setTimeout(() => reject(new Error("Timeout: Busca de dados excedeu o tempo limite")), 30000);
    });
    
    // Buscar faturamento e pedidos usando Promise.race para implementar timeout
    const [faturamentoData, pedidoData] = await Promise.all([
      Promise.race([fetchInBatches<FaturamentoItem>(fetchFaturamentoBatch, batchSize), timeoutPromise]),
      Promise.race([fetchInBatches<PedidoItem>(fetchPedidoBatch, batchSize), timeoutPromise])
    ]);
    
    const faturamentoTotal = faturamentoData?.length || 0;
    const pedidoTotal = pedidoData?.length || 0;
    
    console.log(`Total de registros de faturamento recuperados: ${faturamentoTotal}`);
    console.log(`Total de registros de pedidos recuperados: ${pedidoTotal}`);

    // Validar se os dados estão dentro do período solicitado
    const validarDadosFaturamento = (faturamentoData: FaturamentoItem[]) => {
      if (faturamentoData.length === 0) return true;
      
      // Verificar alguns registros aleatórios para diagnóstico (máximo 20)
      const sampleSize = Math.min(20, faturamentoData.length);
      const amostra = Array(sampleSize).fill(0).map(() => 
        faturamentoData[Math.floor(Math.random() * faturamentoData.length)]
      );
      
      const foraDoIntervalo = amostra.filter(item => {
        if (!item.DATA_EMISSAO) return false;
        const dataEmissao = new Date(item.DATA_EMISSAO);
        return dataEmissao < new Date(`${startDateStr}T00:00:00.000`) || 
               dataEmissao > new Date(`${endDateStr}T23:59:59.999`);
      });
      
      if (foraDoIntervalo.length > 0) {
        console.warn(`ATENÇÃO: Encontrados ${foraDoIntervalo.length} de ${sampleSize} registros na amostra fora do intervalo de datas solicitado.`);
        return false;
      }
      
      return true;
    };
    
    // Verificar se temos dados fora do período
    const dadosValidos = validarDadosFaturamento(faturamentoData);
    if (!dadosValidos) {
      console.warn("Os dados podem conter registros fora do período solicitado. Considere refinar a consulta.");
    }

    // Processar os dados de faturamento 
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

    return returnData;
  } catch (error) {
    console.error('Erro ao buscar dados de dashboard comercial:', error);
    throw error;
  }
};
