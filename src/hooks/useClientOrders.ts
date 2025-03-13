
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { useTotals } from "@/hooks/useJabOrders";
import { filterGroupsBySearchCriteria } from "@/utils/clientOrdersUtils";
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
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
  });

  // Log complete results after fetching
  useMemo(() => {
    if (ordersError) {
      console.error('Error fetching client orders:', ordersError);
    }
    
    if (ordersByClientData) {
      const clientCount = Object.keys(ordersByClientData.clientGroups).length;
      console.log(`Loaded data for ${clientCount} clients with ${ordersByClientData.totalCount} total orders`);
      
      // Log all client names to verify we have all of them
      console.log("=== ALL CLIENTS LOADED ===");
      const clientNames = Object.keys(ordersByClientData.clientGroups).sort();
      console.log(`Total clients: ${clientNames.length}`);
      clientNames.forEach(name => {
        const client = ordersByClientData.clientGroups[name];
        console.log(`${name}: ${client.total_pedidos_distintos || 0} pedidos`);
      });
      
      // Check if total matches what we expect
      console.log(`Total calculated from clients: ${
        Object.values(ordersByClientData.clientGroups).reduce(
          (sum: number, client: any) => sum + (client.total_pedidos_distintos || 0), 
          0
        )
      }`);
      console.log(`Total from API: ${ordersByClientData.totalCount}`);
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
