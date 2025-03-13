
import type { ClientOrderGroup } from "@/types/clientOrders";
import type { JabOrdersResponse } from "@/types/jabOrders";
import { enhanceGroupsWithRepresentanteNames } from "./representativeUtils";

/**
 * Groups orders by client
 * @param ordersData The JabOrders API response
 * @returns Record of client name to ClientOrderGroup
 */
export const groupOrdersByClient = (ordersData: JabOrdersResponse): Record<string, ClientOrderGroup> => {
  const groups: Record<string, ClientOrderGroup> = {};
  
  ordersData.orders.forEach((order) => {
    if (!["1", "2"].includes(order.STATUS)) return;
    
    const clientKey = order.APELIDO || "Sem Cliente";
    if (!groups[clientKey]) {
      groups[clientKey] = {
        pedidos: [],
        totalQuantidadeSaldo: 0,
        totalValorSaldo: 0,
        totalValorPedido: 0,
        totalValorFaturado: 0,
        totalValorFaturarComEstoque: 0,
        representante: order.REPRESENTANTE_NOME,
        allItems: [],
        PES_CODIGO: order.PES_CODIGO
      };
    }

    groups[clientKey].pedidos.push(order);
    groups[clientKey].totalQuantidadeSaldo += order.total_saldo || 0;
    groups[clientKey].totalValorSaldo += order.valor_total || 0;

    if (order.items) {
      const items = order.items.map(item => ({
        ...item,
        pedido: order.PED_NUMPEDIDO,
        APELIDO: order.APELIDO,
        PES_CODIGO: order.PES_CODIGO
      }));
      
      groups[clientKey].allItems.push(...items);
      
      order.items.forEach(item => {
        groups[clientKey].totalValorPedido += item.QTDE_PEDIDA * item.VALOR_UNITARIO;
        groups[clientKey].totalValorFaturado += item.QTDE_ENTREGUE * item.VALOR_UNITARIO;
        if ((item.FISICO || 0) > 0) {
          groups[clientKey].totalValorFaturarComEstoque += Math.min(item.QTDE_SALDO, item.FISICO || 0) * item.VALOR_UNITARIO;
        }
      });
    }
  });

  return groups;
};

/**
 * Filters groups by search criteria
 * @param groupedOrders The grouped orders
 * @param isSearching Whether searching is active
 * @param searchQuery The search query
 * @param searchType The type of search (pedido, cliente, representante)
 * @returns Filtered groups
 */
export const filterGroupsBySearchCriteria = (
  groupedOrders: Record<string, ClientOrderGroup>,
  isSearching: boolean,
  searchQuery: string,
  searchType: string
): Record<string, ClientOrderGroup> => {
  if (!isSearching || !searchQuery) return groupedOrders;

  const normalizedSearchQuery = searchQuery.toLowerCase().trim();
  const filteredGroups: Record<string, ClientOrderGroup> = {};

  const removeLeadingZeros = (str: string) => {
    return str.replace(/^0+/, '');
  };

  Object.entries(groupedOrders).forEach(([clientName, groupData]) => {
    let shouldInclude = false;

    switch (searchType) {
      case "pedido":
        shouldInclude = groupData.pedidos.some(order => {
          const normalizedOrderNumber = removeLeadingZeros(order.PED_NUMPEDIDO);
          const normalizedSearchNumber = removeLeadingZeros(searchQuery);
          return normalizedOrderNumber.includes(normalizedSearchNumber);
        });
        break;
      
      case "cliente":
        shouldInclude = clientName.toLowerCase().includes(normalizedSearchQuery);
        break;
      
      case "representante":
        shouldInclude = groupData.representante?.toLowerCase().includes(normalizedSearchQuery) || false;
        break;
    }

    if (shouldInclude) {
      filteredGroups[clientName] = groupData;
    }
  });

  return filteredGroups;
};

// Re-export for backward compatibility
export { enhanceGroupsWithRepresentanteNames };
