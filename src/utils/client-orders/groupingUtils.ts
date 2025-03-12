
import type { JabOrdersResponse } from "@/types/jabOrders";
import type { ClientOrderGroup } from "@/types/clientOrders";

// Group orders by client
export const groupOrdersByClient = (data: JabOrdersResponse): Record<string, ClientOrderGroup> => {
  const groupedOrders: Record<string, ClientOrderGroup> = {};

  data.orders.forEach(order => {
    const clientName = order.APELIDO || `Cliente ${order.PES_CODIGO}`;
    
    if (!groupedOrders[clientName]) {
      groupedOrders[clientName] = {
        pedidos: [],
        totalQuantidadeSaldo: 0,
        totalValorSaldo: 0,
        totalValorPedido: 0,
        totalValorFaturado: 0,
        totalValorFaturarComEstoque: 0,
        representante: order.REPRESENTANTE_NOME,
        allItems: [],
        PES_CODIGO: order.PES_CODIGO,
        valoresVencidos: 0,
        volumeSaudavel: null
      };
    }

    // Add this order to the client's pedidos array
    groupedOrders[clientName].pedidos.push(order);
    
    // Add the order's items to the allItems array 
    const items = order.items.map(item => ({
      ...item,
      pedido: order.PED_NUMPEDIDO,
      APELIDO: order.APELIDO,
      PES_CODIGO: order.PES_CODIGO
    }));
    groupedOrders[clientName].allItems.push(...items);

    // Update totals
    let orderTotalSaldo = 0;
    let orderTotalPedido = 0;
    let orderTotalFaturarComEstoque = 0;

    order.items.forEach(item => {
      const saldo = item.QTDE_SALDO;
      const valor = item.VALOR_UNITARIO;
      const valorTotal = saldo * valor;
      
      groupedOrders[clientName].totalQuantidadeSaldo += saldo;
      groupedOrders[clientName].totalValorSaldo += valorTotal;
      
      orderTotalSaldo += valorTotal;

      const totalPedido = (item.QTDE_PEDIDA * valor);
      const totalFaturado = (item.QTDE_ENTREGUE * valor);
      
      groupedOrders[clientName].totalValorPedido += totalPedido;
      groupedOrders[clientName].totalValorFaturado += totalFaturado;
      
      orderTotalPedido += totalPedido;

      if (item.FISICO && item.FISICO > 0) {
        const valorFaturarComEstoque = Math.min(saldo, item.FISICO) * valor;
        groupedOrders[clientName].totalValorFaturarComEstoque += valorFaturarComEstoque;
        orderTotalFaturarComEstoque += valorFaturarComEstoque;
      }
    });
  });

  return groupedOrders;
};
