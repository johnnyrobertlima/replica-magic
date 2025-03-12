
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches unique orders from the database for the given date range with pagination
 */
export async function fetchPedidosUnicos(
  dataInicial: string, 
  dataFinal: string, 
  page: number, 
  pageSize: number
): Promise<{ data: any[], totalCount: number }> {
  const { data: todosPedidos, error } = await supabase.rpc('get_pedidos_unicos', {
    data_inicial: dataInicial,
    data_final: `${dataFinal} 23:59:59.999`,
    offset_val: (page - 1) * pageSize,
    limit_val: pageSize
  });

  if (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }

  if (!todosPedidos?.length) {
    return { data: [], totalCount: 0 };
  }

  return { 
    data: todosPedidos, 
    totalCount: todosPedidos[0].total_count 
  };
}

/**
 * Fetches all unique orders from the database for the given date range
 */
export async function fetchAllPedidosUnicos(
  dataInicial: string, 
  dataFinal: string
): Promise<{ data: any[], totalCount: number }> {
  const { data, error } = await supabase.rpc('get_pedidos_unicos', {
    data_inicial: dataInicial,
    data_final: `${dataFinal} 23:59:59.999`,
    offset_val: 0,
    limit_val: 9999
  });

  if (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw error;
  }

  if (!data?.length) {
    return { data: [], totalCount: 0 };
  }

  return {
    data,
    totalCount: data[0].total_count
  };
}
