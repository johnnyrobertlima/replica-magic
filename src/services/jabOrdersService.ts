
import type { UseJabOrdersOptions, JabOrdersResponse } from "@/types/jabOrders";
import { 
  fetchPedidosUnicos, 
  fetchAllPedidosUnicos,
  fetchAllPedidosDireto,
  fetchPedidosDetalhados,
  fetchItensSeparacao,
  processOrdersFetch
} from "./jab/fetchUtils";

export { fetchTotals } from "./jab/totalsService";

// Cache configuration
const ordersCache = new Map<string, { data: JabOrdersResponse; timestamp: number }>();
const clientOrdersCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
  const cacheKey = `orders_${dataInicial}_${dataFinal}_${page}_${pageSize}`;

  // Check cache
  const cachedData = ordersCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log('Using cached data for period:', { dataInicial, dataFinal, page, pageSize });
    return cachedData.data;
  }

  console.log('Fetching orders for period:', { dataInicial, dataFinal, page, pageSize });

  const { data: pedidosUnicos, totalCount } = await fetchPedidosUnicos(dataInicial, dataFinal, page, pageSize);
  const numeroPedidos = pedidosUnicos.map(p => p.ped_numpedido);

  if (!numeroPedidos.length) {
    return { orders: [], totalCount };
  }

  const pedidosDetalhados = await fetchPedidosDetalhados(numeroPedidos);

  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount };
  }

  const resultado = await processOrdersFetch(dataInicial, dataFinal, numeroPedidos, pedidosDetalhados, totalCount);
  
  // Store in cache
  ordersCache.set(cacheKey, { data: resultado, timestamp: Date.now() });
  
  return resultado;
}

export async function fetchAllJabOrders({ 
  dateRange 
}: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    return { orders: [], totalCount: 0 };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];
  const cacheKey = `all_orders_${dataInicial}_${dataFinal}`;

  // Check cache
  const cachedData = ordersCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log('Using all cached data for period:', { dataInicial, dataFinal });
    return cachedData.data;
  }

  const pedidosDetalhados = await fetchAllPedidosDireto(dataInicial, dataFinal);

  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount: 0 };
  }

  const numeroPedidosSet = new Set(pedidosDetalhados.map(pedido => pedido.PED_NUMPEDIDO).filter(Boolean));
  const numeroPedidos = Array.from(numeroPedidosSet);

  console.log(`Found ${numeroPedidos.length} unique orders`);

  const resultado = await processOrdersFetch(dataInicial, dataFinal, numeroPedidos, pedidosDetalhados, numeroPedidos.length);
  
  // Store in cache
  ordersCache.set(cacheKey, { data: resultado, timestamp: Date.now() });
  
  return resultado;
}

// Re-export functions for client orders
export { fetchJabOrdersByClient } from './jab/clientOrdersService';
