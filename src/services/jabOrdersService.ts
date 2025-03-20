import type { 
  JabOrdersResponse,
  JabTotalsResponse,
  UseJabOrdersOptions
} from "@/types/jabOrders";

import { 
  fetchPedidosUnicos,
  fetchPedidosDetalhados,
  fetchAllPedidosDireto,
} from "./jab/pedidos/pedidosQueries";

import { fetchTotals as fetchJabTotals } from "./jab/totals/totalsQueries";

import {
  processJabOrders,
  processAllJabOrders
} from "./jab/jabDataProcessor";

// Function to fetch orders with pagination
export async function fetchOrders({ 
  dateRange, 
  page = 1, 
  pageSize = 15 
}: UseJabOrdersOptions): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    console.warn('fetchOrders: Data range is missing from or to', dateRange);
    return { orders: [], totalCount: 0, itensSeparacao: {} };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando pedidos para o período:', { dataInicial, dataFinal, page, pageSize });

  const { data: pedidosUnicos, totalCount } = await fetchPedidosUnicos(dataInicial, dataFinal, page, pageSize);
  
  if (!pedidosUnicos || pedidosUnicos.length === 0) {
    console.log('Nenhum pedido único encontrado para o período');
    return { orders: [], totalCount: 0, itensSeparacao: {} };
  }

  const numeroPedidos = pedidosUnicos.map(p => p.ped_numpedido);

  if (!numeroPedidos.length) {
    console.log('Nenhum pedido único encontrado para o período');
    return { orders: [], totalCount, itensSeparacao: {} };
  }

  const pedidosDetalhados = await fetchPedidosDetalhados(numeroPedidos);

  if (!pedidosDetalhados.length) {
    console.log('Nenhum detalhe de pedido encontrado');
    return { orders: [], totalCount, itensSeparacao: {} };
  }

  const result = await processJabOrders(pedidosDetalhados, numeroPedidos);
  
  return {
    ...result,
    totalCount,
    currentPage: page,
    pageSize
  };
}

// Function to fetch all orders without pagination
export async function fetchAllOrders({ 
  dateRange 
}: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    console.warn('fetchAllOrders: Data range is missing from or to', dateRange);
    return { orders: [], totalCount: 0, itensSeparacao: {} };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando todos os pedidos para o período:', { dataInicial, dataFinal });

  // For JAB, continue using status filter ['1', '2']
  const pedidosDetalhados = await fetchAllPedidosDireto(dataInicial, dataFinal, 'JAB', ['1', '2']);

  if (!pedidosDetalhados.length) {
    console.log('Nenhum pedido detalhado encontrado para o período via busca direta');
    return { orders: [], totalCount: 0, itensSeparacao: {} };
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

// Function to fetch totals
export async function fetchTotals(): Promise<JabTotalsResponse> {
  return await fetchJabTotals();
}
