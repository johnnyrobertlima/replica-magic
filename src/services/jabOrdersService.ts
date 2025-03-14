
import type { 
  JabOrdersResponse,
  JabTotalsResponse,
  UseJabOrdersOptions
} from "@/types/jabOrders";

import { 
  fetchPedidosUnicos,
  fetchPedidosDetalhados,
  fetchAllPedidosDireto,
  fetchTotals as fetchJabTotals
} from "./jab/jabSupabaseClient";

import {
  processJabOrders,
  processAllJabOrders
} from "./jab/jabDataProcessor";

export async function fetchJabOrders({ 
  dateRange, 
  page = 1, 
  pageSize = 15 
}: UseJabOrdersOptions): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    console.warn('fetchJabOrders: Data range is missing from or to', dateRange);
    return { orders: [], totalCount: 0 };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando pedidos para o período:', { dataInicial, dataFinal, page, pageSize });

  const { data: pedidosUnicos, totalCount } = await fetchPedidosUnicos(dataInicial, dataFinal, page, pageSize);
  const numeroPedidos = pedidosUnicos.map(p => p.ped_numpedido);

  if (!numeroPedidos.length) {
    console.log('Nenhum pedido único encontrado para o período');
    return { orders: [], totalCount };
  }

  const pedidosDetalhados = await fetchPedidosDetalhados(numeroPedidos);

  if (!pedidosDetalhados.length) {
    console.log('Nenhum detalhe de pedido encontrado');
    return { orders: [], totalCount };
  }

  const result = await processJabOrders(pedidosDetalhados, numeroPedidos);
  
  return {
    ...result,
    totalCount,
    currentPage: page,
    pageSize
  };
}

export async function fetchAllJabOrders({ 
  dateRange 
}: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    console.warn('fetchAllJabOrders: Data range is missing from or to', dateRange);
    return { orders: [], totalCount: 0 };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando todos os pedidos para o período:', { dataInicial, dataFinal });

  // Buscar todos os pedidos diretamente em vez de usar a função intermediária
  const pedidosDetalhados = await fetchAllPedidosDireto(dataInicial, dataFinal);

  if (!pedidosDetalhados.length) {
    console.log('Nenhum pedido detalhado encontrado para o período via busca direta');
    return { orders: [], totalCount: 0 };
  }

  const result = await processAllJabOrders(pedidosDetalhados);
  console.log(`Processados ${result.orders.length} pedidos no total`);
  
  return {
    ...result,
    totalCount: result.orders.length,
    currentPage: 1,
    pageSize: result.orders.length
  };
}

export async function fetchTotals(): Promise<JabTotalsResponse> {
  return await fetchJabTotals();
}
