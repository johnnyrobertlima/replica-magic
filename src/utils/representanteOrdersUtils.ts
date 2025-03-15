
import { ClientOrderGroup, JabOrder } from "@/types/clientOrders";
import { fetchRepresentanteNames } from "./representativeUtils";

// Function to group orders by representative
export const groupOrdersByRepresentante = async (ordersData: { orders: JabOrder[]; totalCount: number; itensSeparacao: Record<string, any>; }): Promise<Record<string, ClientOrderGroup>> => {
  const { orders } = ordersData;
  const groupedOrders: Record<string, ClientOrderGroup> = {};
  
  // Extract unique representative codes
  const representanteCodes: number[] = [];
  orders.forEach(order => {
    if (order.REPRESENTANTE && !representanteCodes.includes(order.REPRESENTANTE)) {
      representanteCodes.push(order.REPRESENTANTE);
    }
  });
  
  // Fetch all representative names at once
  const representanteMap = await fetchRepresentanteNames(representanteCodes);
  
  // Group orders by representative
  for (const order of orders) {
    const representanteCode = order.REPRESENTANTE;
    
    if (!representanteCode) {
      console.log(`Order ${order.PED_NUMPEDIDO} has no representative code, skipping`);
      continue;
    }
    
    const representanteName = representanteMap.get(representanteCode) || `Representante ${representanteCode}`;
    
    if (!groupedOrders[representanteName]) {
      groupedOrders[representanteName] = {
        PES_CODIGO: order.PES_CODIGO,
        representante: representanteCode.toString(), // Convert number to string here
        representanteNome: representanteName,
        pedidos: [],
        allItems: [],
        totalQuantidadeSaldo: 0,
        totalValorSaldo: 0,
        totalValorPedido: 0,
        totalValorFaturado: 0,
        totalValorFaturarComEstoque: 0,
        valorVencido: 0,
        quantidadeTitulosVencidos: 0,
      };
    }
    
    groupedOrders[representanteName].pedidos.push(order);
    
    // Add items to the allItems array
    if (order.items) {
      for (const item of order.items) {
        groupedOrders[representanteName].allItems.push({
          ...item,
          pedido: order.PED_NUMPEDIDO,
          APELIDO: order.APELIDO,
          PES_CODIGO: order.PES_CODIGO
        });
        
        // Update the calculations
        groupedOrders[representanteName].totalQuantidadeSaldo += item.QTDE_SALDO;
        groupedOrders[representanteName].totalValorSaldo += item.QTDE_SALDO * item.VALOR_UNITARIO;
        groupedOrders[representanteName].totalValorPedido += item.QTDE_PEDIDA * item.VALOR_UNITARIO;
        groupedOrders[representanteName].totalValorFaturado += item.QTDE_ENTREGUE * item.VALOR_UNITARIO;
        
        // For "Faturar com Estoque", only count if the physical quantity is > 0
        if ((item.FISICO || 0) > 0) {
          groupedOrders[representanteName].totalValorFaturarComEstoque += item.QTDE_SALDO * item.VALOR_UNITARIO;
        }
      }
    }
  }
  
  return groupedOrders;
};
