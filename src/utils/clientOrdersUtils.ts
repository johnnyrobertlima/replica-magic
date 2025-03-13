import type { ClientOrderGroup } from "@/types/clientOrders";
import type { JabOrdersResponse } from "@/types/jabOrders";

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

export const calculateTotalSelected = (
  selectedItemsDetails: Record<string, { qtde: number; valor: number }>
): number => {
  return Object.values(selectedItemsDetails).reduce((total, item) => {
    return total + (item.qtde * item.valor);
  }, 0);
};

export const getClientCodeFromItem = (item: any): number | null => {
  let pesCodigoNumerico = null;
  
  if (typeof item.PES_CODIGO === 'number') {
    pesCodigoNumerico = item.PES_CODIGO;
  } else if (typeof item.PES_CODIGO === 'string') {
    const parsed = parseInt(item.PES_CODIGO, 10);
    if (!isNaN(parsed)) {
      pesCodigoNumerico = parsed;
    }
  } else if (item.PES_CODIGO && typeof item.PES_CODIGO === 'object') {
    const value = item.PES_CODIGO.value;
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = parseInt(String(value), 10);
      if (!isNaN(parsed)) {
        pesCodigoNumerico = parsed;
      }
    }
  }

  return pesCodigoNumerico;
};

/**
 * Fetches representative names for the given representative codes
 * @param representanteCodes Array of representative codes
 * @returns Map of representative code to representative name
 */
export const fetchRepresentanteNames = async (representanteCodes: number[]): Promise<Map<number, string>> => {
  try {
    if (!representanteCodes.length) return new Map();
    
    // Filter out any null or undefined codes
    const validCodes = representanteCodes.filter(Boolean);
    if (!validCodes.length) return new Map();
    
    console.log("Fetching representative names for codes:", validCodes);
    
    const { data, error } = await supabase
      .from('vw_representantes')
      .select('codigo_representante, nome_representante')
      .in('codigo_representante', validCodes);
    
    if (error) {
      console.error("Error fetching representative names:", error);
      return new Map();
    }
    
    console.log("Fetched representative data:", data);
    
    const representanteMap = new Map<number, string>();
    data.forEach((rep: { codigo_representante: number, nome_representante: string }) => {
      representanteMap.set(rep.codigo_representante, rep.nome_representante);
    });
    
    return representanteMap;
  } catch (error) {
    console.error("Error in fetchRepresentanteNames:", error);
    return new Map();
  }
};

/**
 * Enhances client order groups with representative names
 * @param groups Client order groups
 * @returns Enhanced client order groups with representative names
 */
export const enhanceGroupsWithRepresentanteNames = async (groups: Record<string, any>) => {
  try {
    // Extract unique representative codes from all groups
    const representanteCodes: number[] = [];
    Object.values(groups).forEach(group => {
      if (group.representante && !representanteCodes.includes(group.representante)) {
        representanteCodes.push(group.representante);
      }
    });
    
    // Fetch all representative names at once
    const representanteMap = await fetchRepresentanteNames(representanteCodes);
    
    // Enhance each group with the representative name
    const enhancedGroups = { ...groups };
    Object.keys(enhancedGroups).forEach(key => {
      const group = enhancedGroups[key];
      if (group.representante && representanteMap.has(group.representante)) {
        group.representanteNome = representanteMap.get(group.representante);
      }
    });
    
    return enhancedGroups;
  } catch (error) {
    console.error("Error enhancing groups with representative names:", error);
    return groups;
  }
};
