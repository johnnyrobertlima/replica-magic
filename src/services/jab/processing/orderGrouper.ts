
/**
 * Groups order data by order number
 */
export function groupOrdersByNumber(pedidosDetalhados: any[]): Map<string, any[]> {
  const pedidosAgrupados = new Map<string, any[]>();
  
  pedidosDetalhados.forEach(pedido => {
    const key = pedido.PED_NUMPEDIDO;
    if (!pedidosAgrupados.has(key)) {
      pedidosAgrupados.set(key, []);
    }
    pedidosAgrupados.get(key)!.push(pedido);
  });
  
  return pedidosAgrupados;
}
