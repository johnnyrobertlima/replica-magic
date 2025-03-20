
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

// Function to fetch BK orders with pagination
export async function fetchBkOrders({ 
  dateRange, 
  page = 1, 
  pageSize = 15 
}: UseJabOrdersOptions): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    console.warn('fetchBkOrders: Data range is missing from or to', dateRange);
    return { orders: [], totalCount: 0, itensSeparacao: {} };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando pedidos BK para o período:', { dataInicial, dataFinal, page, pageSize });

  // Modify the function to filter for BK orders (assuming the JAB database structure)
  const { data: pedidosUnicos, totalCount } = await fetchPedidosUnicos(dataInicial, dataFinal, page, pageSize, 'BK');
  
  if (!pedidosUnicos || pedidosUnicos.length === 0) {
    console.log('Nenhum pedido único BK encontrado para o período');
    return { orders: [], totalCount: 0, itensSeparacao: {} };
  }

  const numeroPedidos = pedidosUnicos.map(p => p.ped_numpedido);

  if (!numeroPedidos.length) {
    console.log('Nenhum pedido único BK encontrado para o período');
    return { orders: [], totalCount, itensSeparacao: {} };
  }

  const pedidosDetalhados = await fetchPedidosDetalhados(numeroPedidos, 'BK');

  if (!pedidosDetalhados.length) {
    console.log('Nenhum detalhe de pedido BK encontrado');
    return { orders: [], totalCount, itensSeparacao: {} };
  }

  // Process orders ensuring CENTROCUSTO = 'BK'
  const result = await processJabOrders(pedidosDetalhados, numeroPedidos);
  
  return {
    ...result,
    totalCount,
    currentPage: page,
    pageSize
  };
}

// Function to fetch all BK orders without pagination
export async function fetchAllBkOrders({ 
  dateRange 
}: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    console.warn('fetchAllBkOrders: Data range is missing from or to', dateRange);
    return { orders: [], totalCount: 0, itensSeparacao: {} };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando todos os pedidos BK para o período:', { dataInicial, dataFinal });

  // Fetch all BK orders directly
  const pedidosDetalhados = await fetchAllPedidosDireto(dataInicial, dataFinal, 'BK');

  if (!pedidosDetalhados.length) {
    console.log('Nenhum pedido detalhado BK encontrado para o período via busca direta');
    return { orders: [], totalCount: 0, itensSeparacao: {} };
  }

  const result = await processAllJabOrders(pedidosDetalhados);
  console.log(`Processados ${result.orders.length} pedidos BK no total`);
  
  return {
    ...result,
    totalCount: result.orders.length,
    currentPage: 1,
    pageSize: result.orders.length
  };
}

// Function to fetch BK order totals
export async function fetchBkTotals(): Promise<JabTotalsResponse> {
  // Adapt to fetch only BK totals
  return await fetchJabTotals('BK');
}
