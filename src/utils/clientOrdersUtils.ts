import type { JabOrder, JabOrderItem } from "@/types/jabOrders";
import type { ClientOrderGroup } from "@/types/clientOrders";
import type { SearchType } from "@/components/jab-orders/SearchFilters";

export const groupOrdersByClient = (
  ordersData: { 
    orders: JabOrder[], 
    totalCount: number, 
    itensSeparacao: Record<string, any>,
    clientInfo?: Record<string, any> // Add clientInfo to include financial data
  }
) => {
  const groups: Record<string, ClientOrderGroup> = {};

  ordersData.orders.forEach(order => {
    const clientName = order.APELIDO || `Cliente ${order.PES_CODIGO}`;
    
    if (!groups[clientName]) {
      groups[clientName] = {
        pedidos: [],
        allItems: [],
        totalQuantidadeSaldo: 0,
        totalValorSaldo: 0,
        totalValorPedido: 0,
        totalValorFaturado: 0,
        totalValorFaturarComEstoque: 0,
        representante: null,
        PES_CODIGO: order.PES_CODIGO,
        // Initialize financial information
        valoresVencidos: 0,
        volumeSaudavel: null,
        representanteNome: null
      };
      
      // Add financial information if available
      if (ordersData.clientInfo && ordersData.clientInfo[order.PES_CODIGO]) {
        const clientInfo = ordersData.clientInfo[order.PES_CODIGO];
        groups[clientName].valoresVencidos = clientInfo.valoresVencidos || 0;
        groups[clientName].volumeSaudavel = clientInfo.volumeSaudavel || null;
        groups[clientName].representanteNome = clientInfo.representanteNome || null;
      }
    }
    
    groups[clientName].pedidos.push(order);
    groups[clientName].representante = order.REPRESENTANTE;

    // Agrupar todos os itens do pedido
    order.itens.forEach(item => {
      const allItem = {
        ...item,
        pedido: order.PED_NUMPEDIDO,
        APELIDO: order.APELIDO,
        PES_CODIGO: order.PES_CODIGO,
      };
      groups[clientName].allItems.push(allItem);
    });

    // Calcular os totais
    groups[clientName].totalQuantidadeSaldo += order.itens.reduce((sum, item) => sum + item.QTDSALDO, 0);
    groups[clientName].totalValorSaldo += order.itens.reduce((sum, item) => sum + item.VALORSALDO, 0);
    groups[clientName].totalValorPedido += order.itens.reduce((sum, item) => sum + item.VLRVENDA, 0);
    groups[clientName].totalValorFaturado += order.itens.reduce((sum, item) => sum + item.VLRFATURADO, 0);
    groups[clientName].totalValorFaturarComEstoque += order.itens.reduce((sum, item) => sum + item.VLRFATURARCOMSTOQUE, 0);
  });

  return groups;
};

export const filterGroupsBySearchCriteria = (
  groups: Record<string, ClientOrderGroup>,
  isSearching: boolean,
  searchQuery: string,
  searchType: SearchType
) => {
  // If not searching or empty search query, return all groups
  if (!isSearching || !searchQuery.trim()) return groups;

  const filteredGroups: Record<string, ClientOrderGroup> = {};
  const query = searchQuery.toLowerCase().trim();

  Object.entries(groups).forEach(([clientName, group]) => {
    // Search by client name
    if (searchType === 'cliente' && clientName.toLowerCase().includes(query)) {
      filteredGroups[clientName] = group;
      return;
    }

    // Search by order number
    if (searchType === 'pedido') {
      const hasMatchingOrder = group.pedidos.some(pedido => 
        pedido.PED_NUMPEDIDO.toLowerCase().includes(query)
      );
      
      if (hasMatchingOrder) {
        filteredGroups[clientName] = group;
        return;
      }
    }

    // Search by representative name (new)
    if (searchType === 'representante' && 
        group.representanteNome && 
        group.representanteNome.toLowerCase().includes(query)) {
      filteredGroups[clientName] = group;
      return;
    }
  });

  return filteredGroups;
};
