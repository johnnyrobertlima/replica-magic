
import { supabase } from "@/integrations/supabase/client";
import { batchArray } from "../utils";
import type { PedidoUnicoResult } from "@/types/jabOrders";

export async function fetchPedidosUnicos(
  dataInicial: string, 
  dataFinal: string, 
  page: number, 
  pageSize: number
): Promise<{ data: PedidoUnicoResult[], totalCount: number }> {
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
    data: todosPedidos as PedidoUnicoResult[], 
    totalCount: todosPedidos[0].total_count 
  };
}

export async function fetchAllPedidosUnicos(
  dataInicial: string, 
  dataFinal: string
): Promise<{ data: PedidoUnicoResult[], totalCount: number }> {
  const { data, error } = await supabase.rpc('get_pedidos_unicos', {
    data_inicial: dataInicial,
    data_final: `${dataFinal} 23:59:59.999`,
    offset_val: 0,
    limit_val: 9999 // Um número grande para pegar todos
  });

  if (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw error;
  }

  if (!data?.length) {
    return { data: [], totalCount: 0 };
  }

  return {
    data: data as PedidoUnicoResult[],
    totalCount: data[0].total_count
  };
}

export async function fetchAllPedidosDireto(
  dataInicial: string, 
  dataFinal: string
): Promise<any[]> {
  console.log('Buscando todos os pedidos diretamente para o período:', { dataInicial, dataFinal });
  
  // Devido ao limite de 1000 registros por consulta, precisamos buscar em lotes
  let allPedidos: any[] = [];
  let hasMore = true;
  let page = 0;
  const pageSize = 1000;
  
  while (hasMore) {
    console.log(`Buscando lote ${page + 1} de pedidos (${pageSize} por lote)`);
    
    const { data, error, count } = await supabase
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
      `, { count: 'exact' })
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .gte('DATA_PEDIDO', dataInicial)
      .lte('DATA_PEDIDO', `${dataFinal} 23:59:59.999`)
      .range(page * pageSize, (page + 1) * pageSize - 1)
      .order('PED_NUMPEDIDO');

    if (error) {
      console.error(`Erro ao buscar lote ${page + 1} de pedidos:`, error);
      throw error;
    }

    if (data && data.length > 0) {
      allPedidos = [...allPedidos, ...data];
      console.log(`Lote ${page + 1}: Recebidos ${data.length} pedidos. Total até agora: ${allPedidos.length}`);
      
      // Verifica se ainda há mais dados para buscar
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`Encontrados ${allPedidos.length} registros de pedidos diretamente em ${page + 1} lotes`);
  return allPedidos;
}

export async function fetchPedidosDetalhados(numeroPedidos: string[]) {
  if (!numeroPedidos.length) return [];
  
  // Divide em lotes de 100 para não exceder limites de consulta
  const batchSize = 100;
  const batches = batchArray(numeroPedidos, batchSize);
  
  console.log(`Buscando detalhes em ${batches.length} lotes`);
  
  // Busca cada lote de pedidos
  const allResults = [];
  for (const batch of batches) {
    const { data, error } = await supabase
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
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .in('PED_NUMPEDIDO', batch);

    if (error) {
      console.error('Erro ao buscar detalhes dos pedidos:', error);
      throw error;
    }
    
    if (data) {
      allResults.push(...data);
    }
  }

  return allResults;
}
