
import { JabOrder } from "@/types/jabOrders";

/**
 * Creates maps for quick data lookup from raw database results
 */
export function createOrderDataMaps(
  pessoas: any[],
  itens: any[],
  estoque: any[],
) {
  return {
    pessoasMap: new Map(pessoas.map(p => [p.PES_CODIGO, p])),
    itemMap: new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO])),
    estoqueMap: new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]))
  };
}

/**
 * Maps order items from raw data to structured JabOrder items
 */
export function mapOrderItems(
  pedidos: any[],
  pessoasMap: Map<number, any>,
  itemMap: Map<string, string>,
  estoqueMap: Map<string, number>,
  itensSeparacao: Record<string, boolean>
) {
  const items = new Map<string, any>();
  let total_saldo = 0;
  let valor_total = 0;

  const primeiroPedido = pedidos[0] || {};
  const pessoa = pessoasMap.get(primeiroPedido.PES_CODIGO);

  pedidos.forEach(pedido => {
    if (!pedido.ITEM_CODIGO) return;

    const saldo = pedido.QTDE_SALDO || 0;
    const valorUnitario = pedido.VALOR_UNITARIO || 0;
    
    total_saldo += saldo;
    valor_total += saldo * valorUnitario;

    items.set(pedido.ITEM_CODIGO, {
      ITEM_CODIGO: pedido.ITEM_CODIGO,
      DESCRICAO: itemMap.get(pedido.ITEM_CODIGO) || null,
      QTDE_SALDO: saldo,
      QTDE_PEDIDA: pedido.QTDE_PEDIDA || 0,
      QTDE_ENTREGUE: pedido.QTDE_ENTREGUE || 0,
      VALOR_UNITARIO: valorUnitario,
      FISICO: estoqueMap.get(pedido.ITEM_CODIGO) || null,
      emSeparacao: itensSeparacao[pedido.ITEM_CODIGO] || false,
      pedido: pedido.PED_NUMPEDIDO,
      APELIDO: pessoa?.APELIDO || null,
      PES_CODIGO: primeiroPedido.PES_CODIGO
    });
  });

  return {
    items: Array.from(items.values()),
    total_saldo,
    valor_total
  };
}

/**
 * Maps a raw order to a structured JabOrder
 */
export function mapOrderData(
  pedidos: any[],
  pessoasMap: Map<number, any>,
  itemMap: Map<string, string>,
  estoqueMap: Map<string, number>,
  itensSeparacao: Record<string, boolean>
): JabOrder | null {
  const primeiroPedido = pedidos[0];
  
  if (!primeiroPedido) {
    console.log('Pedido não encontrado');
    return null;
  }

  const pessoa = pessoasMap.get(primeiroPedido.PES_CODIGO);
  const { items, total_saldo, valor_total } = mapOrderItems(
    pedidos, 
    pessoasMap, 
    itemMap, 
    estoqueMap, 
    itensSeparacao
  );

  return {
    MATRIZ: primeiroPedido.MATRIZ || 0,
    FILIAL: primeiroPedido.FILIAL || 0,
    PED_NUMPEDIDO: primeiroPedido.PED_NUMPEDIDO,
    PED_ANOBASE: primeiroPedido.PED_ANOBASE || 0,
    total_saldo,
    valor_total,
    APELIDO: pessoa?.APELIDO || null,
    PEDIDO_CLIENTE: primeiroPedido.PEDIDO_CLIENTE || null,
    STATUS: primeiroPedido.STATUS || '',
    REPRESENTANTE: primeiroPedido.REPRESENTANTE,
    REPRESENTANTE_NOME: primeiroPedido.REPRESENTANTE_NOME || null,
    PES_CODIGO: primeiroPedido.PES_CODIGO,
    items
  };
}

/**
 * Groups orders by client for client-based views
 */
export function groupOrdersByClient(orders: JabOrder[]): Map<number, JabOrder[]> {
  const clientGroupsMap = new Map<number, JabOrder[]>();
  
  orders.forEach(order => {
    if (!order.PES_CODIGO) return;
    
    if (!clientGroupsMap.has(order.PES_CODIGO)) {
      clientGroupsMap.set(order.PES_CODIGO, []);
    }
    
    clientGroupsMap.get(order.PES_CODIGO)!.push(order);
  });

  return clientGroupsMap;
}
