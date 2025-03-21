
import { supabase } from '../base/supabaseClient';

/**
 * Fetches unique pedidos with pagination
 */
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

/**
 * Fetches all unique pedidos (for exportation)
 */
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
