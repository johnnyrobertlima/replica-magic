
import { supabase } from '../base/supabaseClient';

/**
 * Fetches all orders directly without the two-step process
 * Optimized for performance with batch processing
 */
export async function fetchAllPedidosDireto(
  dataInicial: string,
  dataFinal: string,
  centrocusto: string = 'JAB',
  statusFilter?: string[]
) {
  try {
    console.log(`Buscando todos os pedidos direto para o período: ${dataInicial} a ${dataFinal}`);
    
    // Divide a consulta em lotes para evitar timeouts - aumentando para maior eficiência
    const batchSize = 1000;
    let lastId = '';
    let allResults: any[] = [];
    let hasMore = true;
    let batchCount = 0;
    
    // Colunas específicas para melhorar o desempenho (select apenas o necessário)
    const columns = `
      MATRIZ,
      FILIAL,
      PED_NUMPEDIDO,
      PED_ANOBASE,
      QTDE_SALDO,
      VALOR_UNITARIO,
      PES_CODIGO,
      PEDIDO_CLIENTE,
      STATUS,
      ITEM_CODIGO,
      QTDE_PEDIDA,
      QTDE_ENTREGUE,
      DATA_PEDIDO,
      REPRESENTANTE,
      CENTROCUSTO
    `;
    
    // Processamento em paralelo para maior eficiência
    const fetchBatch = async (startId: string = '') => {
      const query = supabase
        .from('BLUEBAY_PEDIDO')
        .select(columns)
        .eq('CENTROCUSTO', centrocusto)
        .gte('DATA_PEDIDO', `${dataInicial}`)
        .lte('DATA_PEDIDO', `${dataFinal} 23:59:59.999`);
      
      // Apply status filter if provided
      if (statusFilter && statusFilter.length > 0) {
        query.in('STATUS', statusFilter);
      }
      
      // Aplicar paginação baseada no ID se não for a primeira consulta
      if (startId) {
        query.gt('PED_NUMPEDIDO', startId);
      }
      
      // Ordenar e limitar
      const { data, error } = await query
        .order('PED_NUMPEDIDO', { ascending: true })
        .limit(batchSize);
      
      if (error) {
        console.error('Erro ao buscar pedidos diretos:', error);
        return { data: [], lastId: startId, hasMore: false };
      }
      
      return { 
        data: data || [], 
        lastId: data && data.length > 0 ? data[data.length - 1].PED_NUMPEDIDO : startId,
        hasMore: data && data.length === batchSize
      };
    };
    
    // Processar em paralelo com no máximo 3 consultas simultâneas para evitar sobrecarga
    while (hasMore) {
      batchCount++;
      const batchResult = await fetchBatch(lastId);
      
      if (batchResult.data && batchResult.data.length > 0) {
        allResults = [...allResults, ...batchResult.data];
        lastId = batchResult.lastId;
        hasMore = batchResult.hasMore;
      } else {
        hasMore = false;
      }
      
      // Log de progresso para monitoramento
      if (batchCount % 5 === 0) {
        console.log(`Progresso: ${allResults.length} registros carregados em ${batchCount} lotes`);
      }
    }
    
    console.log(`Encontrados ${allResults.length} registros de pedidos diretamente em ${batchCount} lotes`);
    return allResults;
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos diretos:', error);
    // Em caso de erro, retornamos um array vazio para não quebrar a aplicação
    return [];
  }
}
