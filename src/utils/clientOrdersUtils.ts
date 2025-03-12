
import type { JabOrder, JabOrderItem } from "@/types/jabOrders";
import type { ClientOrderGroup } from "@/types/clientOrders";
import type { SearchType } from "@/components/jab-orders/SearchFilters";

export const groupOrdersByClient = (ordersData: { 
  orders: JabOrder[],
  totalCount: number,
  itensSeparacao?: Record<string, boolean>
}) => {
  const groups: Record<string, ClientOrderGroup> = {};

  ordersData.orders.forEach(order => {
    if (!order.APELIDO || !order.PES_CODIGO) return;

    if (!groups[order.APELIDO]) {
      groups[order.APELIDO] = {
        pedidos: [],
        totalQuantidadeSaldo: 0,
        totalValorSaldo: 0,
        totalValorPedido: 0,
        totalValorFaturado: 0,
        totalValorFaturarComEstoque: 0,
        representante: order.REPRESENTANTE_NOME,
        allItems: [],
        PES_CODIGO: order.PES_CODIGO,
        valoresVencidos: 0, // Initialize new field
        volumeSaudavel: null // Initialize new field
      };
    }

    groups[order.APELIDO].pedidos.push(order);
    groups[order.APELIDO].totalQuantidadeSaldo += order.total_saldo;
    groups[order.APELIDO].totalValorSaldo += order.valor_total;
    groups[order.APELIDO].totalValorPedido += order.valor_total; // Assuming valor_total is the pedido value
    
    // Calculate faturado based on items
    let valorFaturado = 0;
    order.items.forEach(item => {
      valorFaturado += (item.QTDE_ENTREGUE || 0) * item.VALOR_UNITARIO;
    });
    groups[order.APELIDO].totalValorFaturado += valorFaturado;

    // Calculate potential faturamento with stock
    let valorFaturarComEstoque = 0;
    order.items.forEach(item => {
      valorFaturarComEstoque += (item.QTDE_SALDO > 0 ? item.QTDE_SALDO : 0) * item.VALOR_UNITARIO;
    });
    groups[order.APELIDO].totalValorFaturarComEstoque += valorFaturarComEstoque;

    order.items.forEach(item => {
      groups[order.APELIDO].allItems.push({
        ...item,
        pedido: order.PED_NUMPEDIDO,
        APELIDO: order.APELIDO,
        PES_CODIGO: order.PES_CODIGO
      });
    });
  });

  return groups;
};

export const filterGroupsBySearchCriteria = (
  groups: Record<string, ClientOrderGroup>,
  isSearching: boolean,
  searchQuery: string,
  searchType: SearchType
): Record<string, ClientOrderGroup> => {
  if (!isSearching) {
    return groups;
  }

  const normalizedSearchQuery = searchQuery.toLowerCase();
  const filteredGroups: Record<string, ClientOrderGroup> = {};

  for (const clientName in groups) {
    if (Object.hasOwnProperty.call(groups, clientName)) {
      const group = groups[clientName];

      const matchesSearch = () => {
        if (!searchQuery) return true;

        if (searchType === "cliente") {
          return clientName.toLowerCase().includes(normalizedSearchQuery);
        } else if (searchType === "pedido") {
          return group.pedidos.some(pedido =>
            pedido.PED_NUMPEDIDO.toLowerCase().includes(normalizedSearchQuery) ||
            (pedido.PEDIDO_CLIENTE?.toLowerCase().includes(normalizedSearchQuery) ?? false)
          );
        } else if (searchType === "representante") {
          return group.representante?.toLowerCase().includes(normalizedSearchQuery) ?? false;
        } else if (searchType === "item") {
          return group.allItems.some(item =>
            item.ITEM_CODIGO.toLowerCase().includes(normalizedSearchQuery) ||
            (item.DESCRICAO?.toLowerCase().includes(normalizedSearchQuery) ?? false)
          );
        }

        return false;
      };

      if (matchesSearch()) {
        filteredGroups[clientName] = group;
      }
    }
  }

  return filteredGroups;
};

// Add missing functions
export const calculateTotalSelected = (selectedItemsDetails: Record<string, { qtde: number; valor: number }>) => {
  return Object.values(selectedItemsDetails).reduce((total, item) => {
    return total + (item.qtde * item.valor);
  }, 0);
};

export const getClientCodeFromItem = (item: any) => {
  return item.PES_CODIGO;
};
