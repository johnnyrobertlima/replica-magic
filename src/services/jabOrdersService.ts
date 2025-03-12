
import type { 
  JabOrder, 
  UseJabOrdersOptions,
  JabOrdersResponse,
} from "@/types/jabOrders";

import { 
  fetchPedidosUnicos,
  fetchAllPedidosUnicos,
  fetchAllPedidosDireto,
  fetchPedidosDetalhados,
  fetchItensSeparacao 
} from "./jab/fetchUtils";

import { 
  fetchRelatedData 
} from "./jab/entityUtils";

import { 
  processOrdersData,
  groupOrdersByNumber 
} from "./jab/orderProcessUtils";

export { fetchTotals } from "./jab/totalsService";

// Cache para armazenar resultados de pedidos por períodos
const ordersCache = new Map<string, { data: JabOrdersResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Fetches JAB orders with pagination
 */
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

  // Verificar cache
  const cachedData = ordersCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log('Usando dados em cache para o período:', { dataInicial, dataFinal, page, pageSize });
    return cachedData.data;
  }

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

  const resultado = await processOrdersFullData(dataInicial, dataFinal, numeroPedidos, pedidosDetalhados, totalCount);
  
  // Armazenar em cache
  ordersCache.set(cacheKey, { data: resultado, timestamp: Date.now() });
  
  return resultado;
}

/**
 * Fetches all JAB orders for the given date range
 */
export async function fetchAllJabOrders({ 
  dateRange 
}: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    return { orders: [], totalCount: 0 };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];
  const cacheKey = `all_orders_${dataInicial}_${dataFinal}`;

  // Verificar cache
  const cachedData = ordersCache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    console.log('Usando todos os dados em cache para o período:', { dataInicial, dataFinal });
    return cachedData.data;
  }

  console.log('Buscando todos os pedidos para o período:', { dataInicial, dataFinal });

  const pedidosDetalhados = await fetchAllPedidosDireto(dataInicial, dataFinal);

  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount: 0 };
  }

  const numeroPedidosSet = new Set<string>();
  pedidosDetalhados.forEach(pedido => {
    if (pedido.PED_NUMPEDIDO) {
      numeroPedidosSet.add(pedido.PED_NUMPEDIDO);
    }
  });
  const numeroPedidos = Array.from(numeroPedidosSet);
  
  console.log(`Total de ${numeroPedidos.length} pedidos únicos encontrados`);
  
  const resultado = await processOrdersFullData(dataInicial, dataFinal, numeroPedidos, pedidosDetalhados, numeroPedidos.length);
  
  // Armazenar em cache
  ordersCache.set(cacheKey, { data: resultado, timestamp: Date.now() });
  
  return resultado;
}

/**
 * Common function to process order data
 */
async function processOrdersFullData(
  dataInicial: string,
  dataFinal: string,
  numeroPedidos: string[],
  pedidosDetalhados: any[],
  totalCount: number
): Promise<JabOrdersResponse> {
  // Extrair IDs únicos para reduzir volume de dados
  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null && id !== undefined))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];
  const representantesCodigos = [...new Set(pedidosDetalhados.map(p => p.REPRESENTANTE).filter(id => id !== null && id !== undefined))] as number[];

  console.log(`Encontrados ${pessoasIds.length} clientes, ${representantesCodigos.length} representantes e ${itemCodigos.length} itens diferentes`);

  // Buscar dados relacionados em paralelo para melhorar desempenho
  const [relatedData, itensSeparacao] = await Promise.all([
    fetchRelatedData(pessoasIds, itemCodigos, representantesCodigos),
    fetchItensSeparacao()
  ]);

  const { pessoas, itens, estoque, representantes } = relatedData;

  // Criar Maps para acesso eficiente de dados
  const pessoasMap = new Map(pessoas.map(p => [p.PES_CODIGO, p]));
  const itemMap = new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO]));
  const estoqueMap = new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]));
  const representantesMap = new Map(representantes.map(r => [r.PES_CODIGO, r.RAZAOSOCIAL]));

  const pedidosAgrupados = groupOrdersByNumber(pedidosDetalhados);

  const orders = processOrdersData(
    numeroPedidos,
    pedidosDetalhados,
    pessoasMap,
    itemMap,
    estoqueMap,
    representantesMap,
    pedidosAgrupados,
    itensSeparacao
  );

  return {
    orders,
    totalCount,
    currentPage: 1,
    pageSize: numeroPedidos.length,
    itensSeparacao
  };
}
