
import type { ClientOrderGroup } from "@/types/clientOrders";
import type { JabOrder, JabOrderItem, JabOrdersResponse } from "@/types/jabOrders";

// Group orders by client
export const groupOrdersByClient = (ordersData: JabOrdersResponse): Record<string, ClientOrderGroup> => {
  const { orders = [] } = ordersData;
  const groups: Record<string, ClientOrderGroup> = {};

  // Process all orders
  orders.forEach(order => {
    const clientName = order.APELIDO || `Cliente ${order.PES_CODIGO}`;
    const clientCode = order.PES_CODIGO;

    // Initialize group if it doesn't exist
    if (!groups[clientName]) {
      groups[clientName] = {
        pedidos: [],
        totalQuantidadeSaldo: 0,
        totalValorSaldo: 0,
        totalValorPedido: 0,
        totalValorFaturado: 0,
        totalValorFaturarComEstoque: 0,
        representante: order.REPRESENTANTE_NOME,
        allItems: [],
        PES_CODIGO: clientCode
      };
    }

    // Add order to group
    groups[clientName].pedidos.push(order);

    // Process each item in the order
    order.items.forEach(item => {
      // Add to total quantity saldo
      groups[clientName].totalQuantidadeSaldo += item.QTDE_SALDO;

      // Calculate values based on the new requirements
      const valorTotalPedido = item.QTDE_PEDIDA * item.VALOR_UNITARIO;
      const valorTotalSaldo = item.QTDE_SALDO * item.VALOR_UNITARIO;
      const valorFaturado = item.QTDE_ENTREGUE * item.VALOR_UNITARIO;
      
      // Calculate faturar com estoque only if there's physical stock available
      const valorComEstoque = (item.FISICO && item.FISICO > 0) ? 
        (item.QTDE_SALDO * item.VALOR_UNITARIO) : 0;

      // Update group totals
      groups[clientName].totalValorPedido += valorTotalPedido;
      groups[clientName].totalValorSaldo += valorTotalSaldo;
      groups[clientName].totalValorFaturado += valorFaturado;
      groups[clientName].totalValorFaturarComEstoque += valorComEstoque;

      // Add to all items with extra properties
      groups[clientName].allItems.push({
        ...item,
        pedido: order.PED_NUMPEDIDO,
        APELIDO: order.APELIDO,
        PES_CODIGO: order.PES_CODIGO
      });
    });
  });

  return groups;
};

// Filter groups by search criteria
export const filterGroupsBySearchCriteria = (
  groups: Record<string, ClientOrderGroup>,
  isSearching: boolean,
  searchQuery: string,
  searchType: string
): Record<string, ClientOrderGroup> => {
  if (!isSearching || !searchQuery) return groups;

  const filteredGroups: Record<string, ClientOrderGroup> = {};
  const searchLower = searchQuery.toLowerCase();

  Object.entries(groups).forEach(([clientName, group]) => {
    // Search in client name
    if (searchType === 'client' && clientName.toLowerCase().includes(searchLower)) {
      filteredGroups[clientName] = group;
      return;
    }

    // Search in items
    if (searchType === 'item') {
      const filteredItems = group.allItems.filter(item => 
        item.ITEM_CODIGO.toLowerCase().includes(searchLower) || 
        (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(searchLower))
      );

      if (filteredItems.length > 0) {
        filteredGroups[clientName] = {
          ...group,
          allItems: filteredItems
        };
      }
    }

    // Search in order numbers
    if (searchType === 'order') {
      const filteredOrders = group.pedidos.filter(order => 
        order.PED_NUMPEDIDO.toLowerCase().includes(searchLower)
      );

      if (filteredOrders.length > 0) {
        const orderItems = filterItemsByOrders(group.allItems, filteredOrders);
        
        filteredGroups[clientName] = {
          ...group,
          pedidos: filteredOrders,
          allItems: orderItems
        };
      }
    }
  });

  return filteredGroups;
};

// Helper function to filter items by orders
const filterItemsByOrders = (items: (JabOrderItem & { pedido: string; APELIDO: string | null; PES_CODIGO: number })[], orders: JabOrder[]) => {
  const orderNumbers = orders.map(order => order.PED_NUMPEDIDO);
  return items.filter(item => orderNumbers.includes(item.pedido));
};

// Calculate total selected value
export const calculateTotalSelected = (selectedItems: Record<string, { qtde: number; valor: number }>) => {
  return Object.values(selectedItems).reduce((total, item) => total + (item.qtde * item.valor), 0);
};

// Get client code from item
export const getClientCodeFromItem = (item: any): string => {
  return String(item.PES_CODIGO || '');
};
