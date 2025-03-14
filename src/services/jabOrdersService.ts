
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
    return { orders: [], totalCount: 0 };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando pedidos para o período:', { dataInicial, dataFinal, page, pageSize });

  const { data: pedidosUnicos, totalCount } = await fetchPedidosUnicos(dataInicial, dataFinal, page, pageSize);
  const numeroPedidos = pedidosUnicos.map(p => p.ped_numpedido);

  if (!numeroPedidos.length) {
    return { orders: [], totalCount };
  }

  const pedidosDetalhados = await fetchPedidosDetalhados(numeroPedidos);

  if (!pedidosDetalhados.length) {
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
    return { orders: [], totalCount: 0 };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando todos os pedidos para o período:', { dataInicial, dataFinal });

  // Buscar todos os pedidos diretamente em vez de usar a função intermediária
  const pedidosDetalhados = await fetchAllPedidosDireto(dataInicial, dataFinal);

  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount: 0 };
  }

  const result = await processAllJabOrders(pedidosDetalhados);
  
  return {
    ...result,
    currentPage: 1,
    pageSize: result.orders.length
  };
}

export async function fetchTotals(): Promise<JabTotalsResponse> {
  return await fetchJabTotals();
}
