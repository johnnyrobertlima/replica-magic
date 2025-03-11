
import type { 
  UseJabOrdersOptions,
  JabOrdersResponse,
  JabTotalsResponse,
  JabOrder
} from "@/types/jabOrders";

import { 
  fetchPedidosUnicos, 
  fetchAllPedidosDireto, 
  fetchPedidosDetalhados, 
  fetchRelatedData, 
  fetchItensSeparacao,
  fetchTotalsData
} from "./jab/fetchJabData";

import {
  processPedidosData,
  processBatchedPedidosData
} from "./jab/processJabData";

/**
 * Main function to fetch paginated JAB orders with detailed information
 */
export async function fetchJabOrders({ 
  dateRange, 
  page = 1, 
  pageSize = 15 
}: UseJabOrdersOptions): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    return { orders: [], totalCount: 0, itensSeparacao: {} };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando pedidos para o período:', { dataInicial, dataFinal, page, pageSize });

  const { data: pedidosUnicos, totalCount } = await fetchPedidosUnicos(dataInicial, dataFinal, page, pageSize);
  const numeroPedidos = pedidosUnicos.map(p => p.ped_numpedido);

  if (!numeroPedidos.length) {
    return { orders: [], totalCount, itensSeparacao: {} };
  }

  const pedidosDetalhados = await fetchPedidosDetalhados(numeroPedidos);

  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount, itensSeparacao: {} };
  }

  // Coleta todos os IDs únicos para buscar dados relacionados
  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null && id !== undefined))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];

  const { pessoas, itens, estoque } = await fetchRelatedData(pessoasIds, itemCodigos);
  const itensSeparacao = await fetchItensSeparacao();

  // Cria mapas para lookup rápido
  const pessoasMap = new Map(pessoas.map(p => [p.PES_CODIGO, p]));
  const itemMap = new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO]));
  const estoqueMap = new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]));

  // Processa os dados para montar os pedidos
  const orders = processPedidosData(
    numeroPedidos,
    pedidosDetalhados,
    pessoasMap,
    itemMap,
    estoqueMap,
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

/**
 * Fetch all JAB orders without pagination
 */
export async function fetchAllJabOrders({ 
  dateRange 
}: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>): Promise<JabOrdersResponse> {
  if (!dateRange?.from || !dateRange?.to) {
    return { orders: [], totalCount: 0, itensSeparacao: {} };
  }

  const dataInicial = dateRange.from.toISOString().split('T')[0];
  const dataFinal = dateRange.to.toISOString().split('T')[0];

  console.log('Buscando todos os pedidos para o período:', { dataInicial, dataFinal });

  // Buscar todos os pedidos diretamente
  const pedidosDetalhados = await fetchAllPedidosDireto(dataInicial, dataFinal);

  if (!pedidosDetalhados.length) {
    return { orders: [], totalCount: 0, itensSeparacao: {} };
  }

  // Coleta todos os IDs únicos para buscar dados relacionados
  const pessoasIds = [...new Set(pedidosDetalhados.map(p => p.PES_CODIGO).filter(id => id !== null && id !== undefined))] as number[];
  const itemCodigos = [...new Set(pedidosDetalhados.map(p => p.ITEM_CODIGO).filter(Boolean))];

  console.log(`Encontrados ${pessoasIds.length} clientes e ${itemCodigos.length} itens diferentes`);

  const { pessoas, itens, estoque } = await fetchRelatedData(pessoasIds, itemCodigos);
  const itensSeparacao = await fetchItensSeparacao();

  // Cria mapas para lookup rápido
  const pessoasMap = new Map(pessoas.map(p => [p.PES_CODIGO, p]));
  const itemMap = new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO]));
  const estoqueMap = new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]));

  // Processa os dados para montar os pedidos
  const orders = processBatchedPedidosData(
    pedidosDetalhados,
    pessoasMap,
    itemMap,
    estoqueMap,
    itensSeparacao
  );

  console.log(`Processados ${orders.length} pedidos`);

  // Agrupar por cliente (usando PES_CODIGO como chave)
  const clientGroupsMap = new Map<number, JabOrder[]>();
  
  orders.forEach(order => {
    if (!order.PES_CODIGO) return;
    
    if (!clientGroupsMap.has(order.PES_CODIGO)) {
      clientGroupsMap.set(order.PES_CODIGO, []);
    }
    
    clientGroupsMap.get(order.PES_CODIGO)!.push(order);
  });

  console.log(`Agrupados em ${clientGroupsMap.size} clientes`);

  // Transformar em uma lista plana
  const ordersFlat = Array.from(clientGroupsMap.values()).flat();

  return {
    orders: ordersFlat,
    totalCount: orders.length,
    currentPage: 1,
    pageSize: orders.length,
    itensSeparacao
  };
}

/**
 * Fetch JAB totals
 */
export async function fetchTotals(): Promise<JabTotalsResponse> {
  return await fetchTotalsData();
}
