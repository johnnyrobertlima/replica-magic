
import { 
  fetchPedidosUnicos,
  fetchAllPedidosDireto,
  fetchPedidosDetalhados,
  fetchRelatedData,
  fetchItensSeparacao
} from "./db";
import { 
  processOrdersData,
  processAllOrdersData
} from "./orderProcessing";
import { 
  formatDateForQuery 
} from "./utils";
import { fetchTotals } from "./totalsCalculation";
import type { 
  UseJabOrdersOptions,
  JabOrdersResponse,
  JabTotalsResponse
} from "@/types/jabOrders";

export async function fetchJabOrders({ 
  dateRange, 
  page = 1, 
  pageSize = 15 
}: UseJabOrdersOptions): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    return { orders: [], totalCount: 0 };
  }

  const dataInicial = formatDateForQuery(dateRange.from);
  const dataFinal = formatDateForQuery(dateRange.to);

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

  // Coleta todos os IDs únicos para buscar dados relacionados
  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null && id !== undefined))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];

  const { pessoas, itens, estoque } = await fetchRelatedData(pessoasIds, itemCodigos);
  const itensSeparacao = await fetchItensSeparacao();

  // Process orders data
  const orders = processOrdersData(
    numeroPedidos,
    pedidosDetalhados,
    pessoas,
    itens,
    estoque,
    itensSeparacao
  );

  return {
    orders,
    totalCount,
    currentPage: page,
    pageSize,
    itensSeparacao
  };
}

export async function fetchAllJabOrders({ 
  dateRange 
}: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    return { orders: [], totalCount: 0 };
  }

  const dataInicial = formatDateForQuery(dateRange.from);
  const dataFinal = formatDateForQuery(dateRange.to);

  console.log('Buscando todos os pedidos para o período:', { dataInicial, dataFinal });

  // Buscar todos os pedidos diretamente em vez de usar a função intermediária
  const pedidosDetalhados = await fetchAllPedidosDireto(dataInicial, dataFinal);

  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount: 0 };
  }

  // Coleta todos os IDs únicos para buscar dados relacionados
  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null && id !== undefined))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];

  console.log(`Encontrados ${pessoasIds.length} clientes e ${itemCodigos.length} itens diferentes`);

  const { pessoas, itens, estoque } = await fetchRelatedData(pessoasIds, itemCodigos);
  const itensSeparacao = await fetchItensSeparacao();

  // Process all orders data
  const ordersFlat = processAllOrdersData(
    pedidosDetalhados,
    pessoas,
    itens,
    estoque,
    itensSeparacao
  );

  return {
    orders: ordersFlat,
    totalCount: ordersFlat.length,
    currentPage: 1,
    pageSize: ordersFlat.length,
    itensSeparacao
  };
}

export { fetchTotals };
