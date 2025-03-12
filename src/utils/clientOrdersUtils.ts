import type { JabOrdersResponse } from "@/types/jabOrders";
import type { ClientOrderGroup } from "@/types/clientOrders";
import type { SearchType } from "@/components/jab-orders/SearchFilters";

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

// Filter groups by search criteria
export const filterGroupsBySearchCriteria = (
  groupedOrders: Record<string, ClientOrderGroup>,
  isSearching: boolean,
  searchQuery: string,
  searchType: SearchType
): Record<string, ClientOrderGroup> => {
  if (!isSearching || !searchQuery) {
    return groupedOrders;
  }

  const filteredGroups: Record<string, ClientOrderGroup> = {};
  const searchLower = searchQuery.toLowerCase();

  // Search by client name
  if (searchType === "cliente") {
    Object.keys(groupedOrders).forEach(clientName => {
      if (clientName.toLowerCase().includes(searchLower)) {
        filteredGroups[clientName] = groupedOrders[clientName];
      }
    });
    return filteredGroups;
  }

  // Search by order number
  if (searchType === "pedido") {
    Object.keys(groupedOrders).forEach(clientName => {
      const group = groupedOrders[clientName];
      const pedidos = group.pedidos.filter(pedido => 
        pedido.PED_NUMPEDIDO.toLowerCase().includes(searchLower) ||
        (pedido.PEDIDO_CLIENTE && pedido.PEDIDO_CLIENTE.toLowerCase().includes(searchLower))
      );
      
      if (pedidos.length > 0) {
        // Create a new filtered group
        const items = group.allItems.filter(item => 
          pedidos.some(pedido => pedido.PED_NUMPEDIDO === item.pedido)
        );
        
        if (items.length > 0) {
          // Calculate new totals based on filtered items
          let totalQuantidadeSaldo = 0;
          let totalValorSaldo = 0;
          let totalValorPedido = 0;
          let totalValorFaturado = 0;
          let totalValorFaturarComEstoque = 0;
          
          items.forEach(item => {
            const saldo = item.QTDE_SALDO;
            const valor = item.VALOR_UNITARIO;
            const valorTotal = saldo * valor;
            
            totalQuantidadeSaldo += saldo;
            totalValorSaldo += valorTotal;
            
            const totalPedido = (item.QTDE_PEDIDA * valor);
            const totalFaturado = (item.QTDE_ENTREGUE * valor);
            
            totalValorPedido += totalPedido;
            totalValorFaturado += totalFaturado;
            
            if (item.FISICO && item.FISICO > 0) {
              const valorFaturarComEstoque = Math.min(saldo, item.FISICO) * valor;
              totalValorFaturarComEstoque += valorFaturarComEstoque;
            }
          });
          
          filteredGroups[clientName] = {
            ...group,
            pedidos,
            allItems: items,
            totalQuantidadeSaldo,
            totalValorSaldo,
            totalValorPedido,
            totalValorFaturado,
            totalValorFaturarComEstoque
          };
        }
      }
    });
    return filteredGroups;
  }

  // Search by item
  if (searchType === "item") {
    Object.keys(groupedOrders).forEach(clientName => {
      const group = groupedOrders[clientName];
      const items = group.allItems.filter(item => 
        item.ITEM_CODIGO.toLowerCase().includes(searchLower) ||
        (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(searchLower))
      );
      
      if (items.length > 0) {
        // Find unique pedidos that contain these items
        const pedidoSet = new Set(items.map(item => item.pedido));
        const pedidos = group.pedidos.filter(pedido => 
          pedidoSet.has(pedido.PED_NUMPEDIDO)
        );
        
        // Calculate new totals based on filtered items
        let totalQuantidadeSaldo = 0;
        let totalValorSaldo = 0;
        let totalValorPedido = 0;
        let totalValorFaturado = 0;
        let totalValorFaturarComEstoque = 0;
        
        items.forEach(item => {
          const saldo = item.QTDE_SALDO;
          const valor = item.VALOR_UNITARIO;
          const valorTotal = saldo * valor;
          
          totalQuantidadeSaldo += saldo;
          totalValorSaldo += valorTotal;
          
          const totalPedido = (item.QTDE_PEDIDA * valor);
          const totalFaturado = (item.QTDE_ENTREGUE * valor);
          
          totalValorPedido += totalPedido;
          totalValorFaturado += totalFaturado;
          
          if (item.FISICO && item.FISICO > 0) {
            const valorFaturarComEstoque = Math.min(saldo, item.FISICO) * valor;
            totalValorFaturarComEstoque += valorFaturarComEstoque;
          }
        });
        
        filteredGroups[clientName] = {
          ...group,
          pedidos,
          allItems: items,
          totalQuantidadeSaldo,
          totalValorSaldo,
          totalValorPedido,
          totalValorFaturado,
          totalValorFaturarComEstoque
        };
      }
    });
    return filteredGroups;
  }

  return groupedOrders;
};

// Calculate total value of selected items
export const calculateTotalSelected = (selectedItemsDetails: Record<string, { qtde: number; valor: number }>) => {
  return Object.values(selectedItemsDetails).reduce((total, item) => {
    return total + (item.qtde * item.valor);
  }, 0);
};

// Get client code from item, ensuring it's a number
export const getClientCodeFromItem = (item: any): number | null => {
  if (!item.PES_CODIGO) return null;
  
  const pesCodigoNumerico = typeof item.PES_CODIGO === 'string' 
    ? parseInt(item.PES_CODIGO, 10) 
    : item.PES_CODIGO;
    
  return isNaN(pesCodigoNumerico) ? null : pesCodigoNumerico;
};
