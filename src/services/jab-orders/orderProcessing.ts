
import { JabOrder } from "@/types/jabOrders";
import { createOrderDataMaps, mapOrderData, groupOrdersByClient } from "./dataMappers";

export function processOrdersData(
  numeroPedidos: string[],
  pedidosDetalhados: any[],
  pessoas: any[],
  itens: any[],
  estoque: any[],
  itensSeparacao: Record<string, boolean>
): JabOrder[] {
  // Create lookup maps
  const { pessoasMap, itemMap, estoqueMap } = createOrderDataMaps(pessoas, itens, estoque);

  // Group orders by number
  const pedidosAgrupados = new Map<string, any[]>();
  pedidosDetalhados.forEach(pedido => {
    const key = pedido.PED_NUMPEDIDO;
    if (!pedidosAgrupados.has(key)) {
      pedidosAgrupados.set(key, []);
    }
    pedidosAgrupados.get(key)!.push(pedido);
  });

  // Process each order maintaining the original order
  const orders: JabOrder[] = numeroPedidos.map(numPedido => {
    const pedidos = pedidosAgrupados.get(numPedido) || [];
    return mapOrderData(pedidos, pessoasMap, itemMap, estoqueMap, itensSeparacao);
  }).filter(Boolean) as JabOrder[];

  return orders;
}

export function processAllOrdersData(
  pedidosDetalhados: any[],
  pessoas: any[],
  itens: any[],
  estoque: any[],
  itensSeparacao: Record<string, boolean>
): JabOrder[] {
  // Extract unique order numbers
  const numeroPedidosSet = new Set<string>();
  pedidosDetalhados.forEach(pedido => {
    if (pedido.PED_NUMPEDIDO) {
      numeroPedidosSet.add(pedido.PED_NUMPEDIDO);
    }
  });
  const numeroPedidos = Array.from(numeroPedidosSet);
  
  console.log(`Total de ${numeroPedidos.length} pedidos únicos encontrados`);

  // Process orders data
  const orders = processOrdersData(
    numeroPedidos,
    pedidosDetalhados,
    pessoas,
    itens,
    estoque,
    itensSeparacao
  );

  console.log(`Processados ${orders.length} pedidos`);

  // Sort and filter orders by client
  const clientGroupsMap = groupOrdersByClient(orders);
  console.log(`Agrupados em ${clientGroupsMap.size} clientes`);

  // Transform to a flat list
  const ordersFlat = Array.from(clientGroupsMap.values()).flat();

  return ordersFlat;
}
