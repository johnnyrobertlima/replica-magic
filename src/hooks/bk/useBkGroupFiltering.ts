
import { useMemo } from "react";
import { ClientOrderGroup } from "@/types/clientOrders";
import { filterGroupsBySearchCriteria } from "@/utils/clientOrdersUtils";
import { OrderStatus } from "@/components/jab-orders/OrdersHeader";

export const useBkGroupFiltering = (
  processedGroups: Record<string, ClientOrderGroup>,
  isSearching: boolean,
  searchQuery: string,
  searchType: string,
  selectedStatuses: OrderStatus[],
  representanteCodigo?: number | null
) => {
  // Filter groups by search criteria, status, and representante (if applicable)
  const filteredGroups = useMemo(() => {
    let groups = filterGroupsBySearchCriteria(processedGroups, isSearching, searchQuery, searchType);

    // Filter by representante if a representante code is provided
    if (representanteCodigo) {
      const filteredByRepresentante: Record<string, ClientOrderGroup> = {};
      
      Object.entries(groups).forEach(([clientName, group]) => {
        // Filter pedidos in the group by representante
        const filteredPedidos = group.pedidos.filter(pedido => 
          pedido.REPRESENTANTE === representanteCodigo
        );
        
        // Only include group if it has pedidos after filtering
        if (filteredPedidos.length > 0) {
          // Create a new group with the filtered pedidos
          // Get all items from the filtered pedidos
          const allFilteredItems = filteredPedidos.flatMap(pedido => 
            (pedido.items || []).map(item => ({
              ...item,
              pedido: pedido.PED_NUMPEDIDO,
              APELIDO: pedido.APELIDO,
              PES_CODIGO: pedido.PES_CODIGO
            }))
          );
          
          filteredByRepresentante[clientName] = {
            ...group,
            pedidos: filteredPedidos,
            allItems: allFilteredItems,
            // Recalculate totals based on filtered items
            totalValorSaldo: allFilteredItems.reduce((sum, item) => sum + (item.QTDE_SALDO * item.VALOR_UNITARIO || 0), 0),
            totalValorFaturarComEstoque: allFilteredItems.reduce((sum, item) => {
              const fisico = item.FISICO || 0;
              const qtdeSaldo = item.QTDE_SALDO || 0;
              const qtdeFaturar = Math.min(fisico, qtdeSaldo);
              return sum + (qtdeFaturar * item.VALOR_UNITARIO || 0);
            }, 0)
          };
        }
      });
      
      groups = filteredByRepresentante;
    }

    // Filter by status if any statuses are selected
    if (selectedStatuses.length > 0) {
      const filteredByStatus: Record<string, ClientOrderGroup> = {};
      
      Object.entries(groups).forEach(([clientName, group]) => {
        // Filter pedidos in the group by status
        const filteredPedidos = group.pedidos.filter(pedido => {
          // Check if the pedido's status matches any of the selected statuses
          return selectedStatuses.includes(pedido.STATUS as OrderStatus) || 
                 (selectedStatuses.includes('0') && pedido.STATUS === 'Bloqueado') ||
                 (selectedStatuses.includes('1') && pedido.STATUS === 'Aberto') ||
                 (selectedStatuses.includes('2') && pedido.STATUS === 'Parcial') ||
                 (selectedStatuses.includes('3') && pedido.STATUS === 'Total') ||
                 (selectedStatuses.includes('4') && pedido.STATUS === 'Cancelado');
        });
        
        // Only include group if it has pedidos after filtering
        if (filteredPedidos.length > 0) {
          // Create a new group with the filtered pedidos
          // Get all items from the filtered pedidos
          const allFilteredItems = filteredPedidos.flatMap(pedido => 
            (pedido.items || []).map(item => ({
              ...item,
              pedido: pedido.PED_NUMPEDIDO,
              APELIDO: pedido.APELIDO,
              PES_CODIGO: pedido.PES_CODIGO
            }))
          );
          
          filteredByStatus[clientName] = {
            ...group,
            pedidos: filteredPedidos,
            allItems: allFilteredItems,
            // Recalculate totals based on filtered items
            totalValorSaldo: allFilteredItems.reduce((sum, item) => sum + (item.QTDE_SALDO * item.VALOR_UNITARIO || 0), 0),
            totalValorFaturarComEstoque: allFilteredItems.reduce((sum, item) => {
              const fisico = item.FISICO || 0;
              const qtdeSaldo = item.QTDE_SALDO || 0;
              const qtdeFaturar = Math.min(fisico, qtdeSaldo);
              return sum + (qtdeFaturar * item.VALOR_UNITARIO || 0);
            }, 0)
          };
        }
      });
      
      return filteredByStatus;
    }
    
    return groups;
  }, [processedGroups, isSearching, searchQuery, searchType, selectedStatuses, representanteCodigo]);

  return filteredGroups;
};
