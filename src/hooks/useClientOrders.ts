
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { useTotals } from "@/hooks/useJabOrders";
import { groupOrdersByClient, filterGroupsBySearchCriteria } from "@/utils/clientOrdersUtils";
import { useClientOrdersState } from "./client-orders/useClientOrdersState";
import { useItemSelection } from "./client-orders/useItemSelection";
import { useSeparationOperations } from "./client-orders/useSeparationOperations";
import { fetchJabOrdersByClient } from "@/services/jab/clientOrdersService";

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

  // Buscar dados de pedidos por cliente usando a nova função otimizada
  const { data: ordersByClientData = { clientGroups: {}, totalCount: 0, itensSeparacao: {} }, isLoading: isLoadingOrders, error: ordersError } = useQuery({
    queryKey: ['jab-orders-by-client', searchDate?.from?.toISOString(), searchDate?.to?.toISOString()],
    queryFn: () => fetchJabOrdersByClient({ dateRange: searchDate }),
    enabled: !!searchDate?.from && !!searchDate?.to,
    staleTime: 10 * 60 * 1000, // 10 minutes (increased from 5)
    gcTime: 20 * 60 * 1000, // 20 minutes (increased from 10)
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
  });

  // Log query results
  useMemo(() => {
    if (ordersError) {
      console.error('Error fetching client orders:', ordersError);
    }
    
    if (ordersByClientData) {
      const clientCount = Object.keys(ordersByClientData.clientGroups).length;
      console.log(`Loaded data for ${clientCount} clients with ${ordersByClientData.totalCount} total orders`);
      
      // Log some statistics about the data
      const allItemsCount = Object.values(ordersByClientData.clientGroups).reduce(
        (total, client: any) => total + (client.allItems?.length || 0), 
        0
      );
      console.log(`Total items across all clients: ${allItemsCount}`);
      
      // Print out some client names for debugging
      const clientNames = Object.keys(ordersByClientData.clientGroups).slice(0, 5);
      console.log(`First few clients: ${clientNames.join(', ')}${clientNames.length < Object.keys(ordersByClientData.clientGroups).length ? '...' : ''}`);
    }
  }, [ordersByClientData, ordersError]);

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();

  // Filter groups by search criteria
  const filteredGroups = useMemo(() => 
    filterGroupsBySearchCriteria(ordersByClientData.clientGroups, isSearching, searchQuery, searchType), 
    [ordersByClientData.clientGroups, isSearching, searchQuery, searchType]
  );

  // Use the item selection hook
  const {
    totalSelecionado,
    handleItemSelect,
    exportSelectedItemsToExcel
  } = useItemSelection(state, setState, filteredGroups);

  // Use the separation operations hook
  const {
    handleEnviarParaSeparacao
  } = useSeparationOperations(state, setState, filteredGroups);

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
    // Data
    ordersData: {
      orders: [],
      totalCount: ordersByClientData.totalCount,
      itensSeparacao: ordersByClientData.itensSeparacao
    },
    totals,
    separacoes,
    filteredGroups,
    totalSelecionado,
    // Loading states
    isLoading: isLoadingOrders || isLoadingTotals || isLoadingSeparacoes,
    // Errors
    error: ordersError,
    // Methods
    toggleExpand,
    handleSearch,
    handleItemSelect,
    handleEnviarParaSeparacao,
    exportSelectedItemsToExcel,
  };
};
