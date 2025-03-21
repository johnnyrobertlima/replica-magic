
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
    const batchSize = 100;
    let allResults: any[] = [];
    
    // Processar em lotes
    for (let i = 0; i < numeroPedidos.length; i += batchSize) {
      const batch = numeroPedidos.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .eq('CENTROCUSTO', centrocusto)
        .in('PED_NUMPEDIDO', batch)
        .in('STATUS', ['1', '2']);

      if (error) {
        console.error(`Erro ao buscar lote ${i/batchSize + 1} de pedidos detalhados:`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        allResults = [...allResults, ...data];
      }
    }

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
    
    // Divide a consulta em lotes para evitar timeouts
    const batchSize = 500;
    let lastId = '';
    let allResults: any[] = [];
    let hasMore = true;
    let batchCount = 0;
    
    while (hasMore) {
      batchCount++;
      const query = supabase
        .from('BLUEBAY_PEDIDO')
        .select(`
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
          REPRESENTANTE
        `)
        .eq('CENTROCUSTO', centrocusto)
        .gte('DATA_PEDIDO', `${dataInicial}`)
        .lte('DATA_PEDIDO', `${dataFinal} 23:59:59.999`);
      
      // Apply status filter if provided
      if (statusFilter && statusFilter.length > 0) {
        query.in('STATUS', statusFilter);
      }
      
      // Aplicar paginação baseada no ID se não for a primeira consulta
      if (lastId) {
        query.gt('PED_NUMPEDIDO', lastId);
      }
      
      // Ordenar e limitar
      const { data, error } = await query
        .order('PED_NUMPEDIDO', { ascending: true })
        .limit(batchSize);
      
      if (error) {
        console.error('Erro ao buscar pedidos diretos:', error);
        throw error;
      }
      
      if (data && data.length > 0) {
        allResults = [...allResults, ...data];
        lastId = data[data.length - 1].PED_NUMPEDIDO;
        
        // Verificar se ainda há mais dados
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
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
