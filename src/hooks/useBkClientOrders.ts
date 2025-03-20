
import { useMemo, useEffect, useState } from "react";
import { useAllBkOrders, useBkTotals } from "@/hooks/useBkOrders";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { groupOrdersByClient, filterGroupsBySearchCriteria } from "@/utils/clientOrdersUtils";
import { enhanceGroupsWithRepresentanteNames } from "@/utils/representativeUtils";
import { useClientOrdersState } from "./client-orders/useClientOrdersState";
import { useItemSelection } from "./client-orders/useItemSelection";
import { useSeparationOperations } from "./client-orders/useSeparationOperations";
import { ClientOrderGroup } from "@/types/clientOrders";
import { OrderStatus } from "@/components/jab-orders/OrdersHeader";

export const useClientOrders = () => {
  // Use the state hook
  const {
    state,
    setState,
    date,
    searchDate,
    expandedClients,
    searchQuery,
    searchType,
    isSearching,
    showZeroBalance,
    showOnlyWithStock,
    selectedItems,
    isSending,
    setDate,
    setSearchQuery,
    setSearchType,
    setShowZeroBalance,
    setShowOnlyWithStock,
    toggleExpand,
    handleSearch
  } = useClientOrdersState();

  // Add selected statuses state
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([]);

  // Data fetching hooks
  const { data: ordersData = { orders: [], totalCount: 0, itensSeparacao: {} }, isLoading: isLoadingOrders } = useAllBkOrders({
    dateRange: searchDate
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useBkTotals();

  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes('BK');

  // State to hold the processed groups
  const [processedGroups, setProcessedGroups] = useState<Record<string, ClientOrderGroup>>({});
  const [isProcessingGroups, setIsProcessingGroups] = useState(false);

  // Group orders by client and process them
  useEffect(() => {
    if (!ordersData || !ordersData.orders || ordersData.orders.length === 0) {
      setProcessedGroups({});
      return;
    }
    
    console.log(`Processando ${ordersData.orders.length} pedidos BK para criar grupos de clientes`);
    
    const processGroups = async () => {
      try {
        setIsProcessingGroups(true);
        
        // First group the orders by client - now this is async to fetch overdue data
        const processableOrdersData = {
          orders: ordersData.orders,
          totalCount: ordersData.totalCount,
          itensSeparacao: ordersData.itensSeparacao || {}
        };
        
        const groups = await groupOrdersByClient(processableOrdersData);
        
        // Then enhance the groups with representative names
        const enhancedGroups = await enhanceGroupsWithRepresentanteNames(groups);
        
        // Store the processed groups in state
        setProcessedGroups(enhancedGroups);
      } catch (error) {
        console.error("Erro ao processar grupos de pedidos BK:", error);
        setProcessedGroups({});
      } finally {
        setIsProcessingGroups(false);
      }
    };
    
    processGroups();
  }, [ordersData]);

  // Filter groups by search criteria and status
  const filteredGroups = useMemo(() => {
    let groups = filterGroupsBySearchCriteria(processedGroups, isSearching, searchQuery, searchType);

    // Filter by status if any statuses are selected
    if (selectedStatuses.length > 0) {
      const filteredByStatus: Record<string, ClientOrderGroup> = {};
      
      Object.entries(groups).forEach(([clientName, group]) => {
        // Filter items in the group by status
        const filteredItems = group.items.filter(item => {
          // Check if the item's status matches any of the selected statuses
          return selectedStatuses.some(status => 
            item.STATUS === status || 
            (status === '0' && item.STATUS === 'Bloqueado') ||
            (status === '1' && item.STATUS === 'Aberto') ||
            (status === '2' && item.STATUS === 'Parcial') ||
            (status === '3' && item.STATUS === 'Total') ||
            (status === '4' && item.STATUS === 'Cancelado')
          );
        });
        
        // Only include group if it has items after filtering
        if (filteredItems.length > 0) {
          // Create a new group with the filtered items and recalculate totals
          const filteredGroup = {
            ...group,
            items: filteredItems,
            // Recalculate totals based on filtered items
            totalValorSaldo: filteredItems.reduce((sum, item) => sum + (item.QTDE_SALDO * item.VALOR_UNITARIO || 0), 0),
            totalValorFaturarComEstoque: filteredItems.reduce((sum, item) => {
              const disponivel = item.DISPONIVEL || 0;
              const qtdeSaldo = item.QTDE_SALDO || 0;
              const qtdeFaturar = Math.min(disponivel, qtdeSaldo);
              return sum + (qtdeFaturar * item.VALOR_UNITARIO || 0);
            }, 0)
          };
          
          filteredByStatus[clientName] = filteredGroup;
        }
      });
      
      return filteredByStatus;
    }
    
    return groups;
  }, [processedGroups, isSearching, searchQuery, searchType, selectedStatuses]);

  // Calculate period-specific totals based on filtered groups
  const periodTotals = useMemo(() => {
    let valorTotalSaldoPeriodo = 0;
    let valorFaturarComEstoquePeriodo = 0;
    let valoresLiberadosParaFaturamento = 0;

    Object.values(filteredGroups).forEach(group => {
      valorTotalSaldoPeriodo += group.totalValorSaldo || 0;
      valorFaturarComEstoquePeriodo += group.totalValorFaturarComEstoque || 0;
      
      // Only count for valoresLiberadosParaFaturamento if client has no overdue titles
      if ((group.valorVencido || 0) <= 0) {
        valoresLiberadosParaFaturamento += group.totalValorFaturarComEstoque || 0;
      }
    });

    return {
      valorTotalSaldoPeriodo,
      valorFaturarComEstoquePeriodo,
      valoresLiberadosParaFaturamento
    };
  }, [filteredGroups]);

  // Use the item selection hook
  const {
    totalSelecionado,
    handleItemSelect,
    exportSelectedItemsToExcel,
    clearSelections
  } = useItemSelection(state, setState, filteredGroups);

  // Use the separation operations hook
  const {
    handleEnviarParaSeparacao
  } = useSeparationOperations(state, setState, processedGroups, 'BK');

  // Combine all totals
  const combinedTotals = {
    ...totals,
    ...periodTotals
  };

  return {
    // State
    date,
    setDate,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    showZeroBalance,
    setShowZeroBalance,
    showOnlyWithStock,
    setShowOnlyWithStock,
    selectedItems,
    expandedClients,
    isSending,
    selectedStatuses,
    setSelectedStatuses,
    // Data
    ordersData,
    totals: combinedTotals,
    separacoes,
    filteredGroups,
    totalSelecionado,
    // Loading states
    isLoading: isLoadingOrders || isLoadingTotals || isLoadingSeparacoes || isProcessingGroups,
    // Methods
    toggleExpand,
    handleSearch,
    handleItemSelect,
    handleEnviarParaSeparacao,
    exportSelectedItemsToExcel,
    clearSelections,
  };
};
