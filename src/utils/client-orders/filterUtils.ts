
import type { ClientOrderGroup } from "@/types/clientOrders";
import type { SearchType } from "@/components/jab-orders/SearchFilters";
import { recalculateGroupTotals } from "./calculationUtils";

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
          // Create a filtered copy of the group with updated totals
          const filteredGroup = {
            ...group,
            pedidos,
            allItems: items,
            totalQuantidadeSaldo: 0,
            totalValorSaldo: 0,
            totalValorPedido: 0,
            totalValorFaturado: 0,
            totalValorFaturarComEstoque: 0
          };
          
          // Recalculate totals based on filtered items
          recalculateGroupTotals(filteredGroup);
          
          filteredGroups[clientName] = filteredGroup;
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
        
        // Create a filtered copy of the group with updated totals
        const filteredGroup = {
          ...group,
          pedidos,
          allItems: items,
          totalQuantidadeSaldo: 0,
          totalValorSaldo: 0,
          totalValorPedido: 0,
          totalValorFaturado: 0,
          totalValorFaturarComEstoque: 0
        };
        
        // Recalculate totals based on filtered items
        recalculateGroupTotals(filteredGroup);
        
        filteredGroups[clientName] = filteredGroup;
      }
    });
    return filteredGroups;
  }

  return groupedOrders;
};
