
import { supabase } from '@/services/jab/base/supabaseClient';

// Function to fetch unique order numbers with pagination
export async function fetchPedidosUnicos(
  dataInicial: string,
  dataFinal: string,
  page: number = 1,
  pageSize: number = 15,
  centrocusto: string = 'JAB'
) {
  try {
    const offset = (page - 1) * pageSize;

    // Build the SQL query with the centrocusto parameter
    const pedidosResult = await supabase.rpc('get_pedidos_unicos_by_centrocusto', {
      data_inicial: dataInicial,
      data_final: dataFinal,
      offset_val: offset,
      limit_val: pageSize,
      centrocusto: centrocusto
    });

    // Check for errors in the response
    if (pedidosResult.error) {
      console.error('Erro ao buscar pedidos únicos:', pedidosResult.error);
      return { data: [], totalCount: 0 };
    }

    // Extract the total count from the first row if available
    const totalCount = pedidosResult.data && pedidosResult.data.length > 0 
      ? pedidosResult.data[0].total_count 
      : 0;

    return { data: pedidosResult.data, totalCount };
  } catch (error) {
    console.error('Exceção ao buscar pedidos únicos:', error);
    return { data: [], totalCount: 0 };
  }
}

// Function to fetch all unique order numbers (for exportation)
export async function fetchAllPedidosUnicos(
  dataInicial: string,
  dataFinal: string,
  centrocusto: string = 'JAB'
) {
  try {
    // Fetch all unique order numbers for the given date range without pagination
    const { data, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('PED_NUMPEDIDO')
      .eq('CENTROCUSTO', centrocusto)
      .in('STATUS', ['1', '2'])
      .gte('DATA_PEDIDO', dataInicial)
      .lte('DATA_PEDIDO', dataFinal)
      .order('PED_NUMPEDIDO');

    if (error) {
      console.error('Erro ao buscar todos os pedidos únicos:', error);
      return [];
    }

    const uniquePedidos = Array.from(new Set(data.map(p => p.PED_NUMPEDIDO)));
    console.log(`Encontrados ${uniquePedidos.length} pedidos únicos no total`);
    return uniquePedidos;
  } catch (error) {
    console.error('Exceção ao buscar todos os pedidos únicos:', error);
    return [];
  }
}

// Function to fetch detailed order information
export async function fetchPedidosDetalhados(
  numeroPedidos: string[],
  centrocusto: string = 'JAB'
) {
  try {
    console.log(`Buscando detalhes para ${numeroPedidos.length} pedidos`);
    
    // Para lidar com muitos pedidos, dividimos em lotes para evitar timeouts
    const batchSize = 200; // Aumentando o tamanho do lote
    let allResults: any[] = [];
    
    // Processar em lotes - executando em paralelo para melhor desempenho
    const batches = [];
    for (let i = 0; i < numeroPedidos.length; i += batchSize) {
      const batch = numeroPedidos.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    const batchPromises = batches.map(async (batch) => {
      const { data, error } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .eq('CENTROCUSTO', centrocusto)
        .in('PED_NUMPEDIDO', batch)
        .in('STATUS', ['1', '2']);

      if (error) {
        console.error(`Erro ao buscar lote de pedidos detalhados:`, error);
        return [];
      }
      
      return data || [];
    });
    
    // Executar todas as consultas em paralelo
    const batchResults = await Promise.all(batchPromises);
    
    // Combinar todos os resultados
    batchResults.forEach(result => {
      allResults = [...allResults, ...result];
    });

    console.log(`Encontrados ${allResults.length} registros detalhados no total`);
    return allResults;
  } catch (error) {
    console.error('Exceção ao buscar pedidos detalhados:', error);
    return [];
  }
}

// Function to fetch all orders directly without the two-step process
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
