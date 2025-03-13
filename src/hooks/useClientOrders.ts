
import { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { useTotals } from "@/hooks/useJabOrders";
import { filterGroupsBySearchCriteria } from "@/utils/clientOrdersUtils";
import { useClientOrdersState } from "./client-orders/useClientOrdersState";
import { useItemSelection } from "./client-orders/useItemSelection";
import { useSeparationOperations } from "./client-orders/useSeparationOperations";
import { fetchJabOrdersByClient } from "@/services/jab/clientOrdersService";
import { toast } from "@/components/ui/use-toast";

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
  const { data: ordersByClientData = { clientGroups: {}, totalCount: 0, itensSeparacao: {} }, isLoading: isLoadingOrders, error: ordersError, refetch } = useQuery({
    queryKey: ['jab-orders-by-client', searchDate?.from?.toISOString(), searchDate?.to?.toISOString()],
    queryFn: () => fetchJabOrdersByClient({ dateRange: searchDate }),
    enabled: !!searchDate?.from && !!searchDate?.to,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
  });

  // Log complete results after fetching
  useEffect(() => {
    if (ordersByClientData) {
      const clientCount = Object.keys(ordersByClientData.clientGroups).length;
      console.log(`DIAGNOSTIC LOG: useClientOrders - Loaded data for ${clientCount} clients with ${ordersByClientData.totalCount} total orders`);
      
      if (clientCount < ordersByClientData.totalCount) {
        console.error(`DIAGNOSTIC ERROR: Only showing ${clientCount} clients but we have ${ordersByClientData.totalCount} total orders!`);
        
        toast({
          title: "Atenção",
          description: `Mostrando ${clientCount} clientes de ${ordersByClientData.totalCount} esperados`,
          variant: "destructive", // Changed from "warning" to "destructive"
        });
      }
      
      // Compare total orders from each client with the reported total
      let calculatedTotal = 0;
      Object.values(ordersByClientData.clientGroups).forEach((client: any) => {
        calculatedTotal += (client.total_pedidos_distintos || 0);
      });
      
      console.log(`DIAGNOSTIC LOG: Total orders sum from client objects: ${calculatedTotal}`);
      console.log(`DIAGNOSTIC LOG: Reported total from API: ${ordersByClientData.totalCount}`);
      
      // Log all client names for debugging
      console.log(`DIAGNOSTIC LOG: All clients in ordersByClientData (${clientCount}):`);
      console.log(JSON.stringify(Object.keys(ordersByClientData.clientGroups)));
      
      if (calculatedTotal !== ordersByClientData.totalCount) {
        console.error(`DIAGNOSTIC ERROR: DISCREPANCY DETECTED - Calculated total (${calculatedTotal}) doesn't match reported total (${ordersByClientData.totalCount})`);
      }
    }
    
    if (ordersError) {
      console.error('Error fetching client orders:', ordersError);
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar os pedidos dos clientes.",
        variant: "destructive",
      });
    }
  }, [ordersByClientData, ordersError]);

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();

  // Filter groups by search criteria
  const filteredGroups = useMemo(() => { 
    const filtered = filterGroupsBySearchCriteria(ordersByClientData.clientGroups, isSearching, searchQuery, searchType);
    console.log(`DIAGNOSTIC LOG: After filtering - ${Object.keys(filtered).length} clients (from ${Object.keys(ordersByClientData.clientGroups).length} total)`);
    
    // Check if filtering reduced the client count too much
    if (isSearching && Object.keys(filtered).length === 0 && Object.keys(ordersByClientData.clientGroups).length > 0) {
      toast({
        title: "Sem resultados",
        description: "Nenhum cliente encontrado com os critérios de busca.",
        variant: "default", // Changed from "warning" to "default" 
      });
    }
    
    return filtered;
  }, [ordersByClientData.clientGroups, isSearching, searchQuery, searchType]);

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
  
  // Additional logging for debugging
  useEffect(() => {
    console.log(`DIAGNOSTIC LOG: JabOrdersByClient rendering status:
    - isLoading: ${isLoadingOrders || isLoadingTotals || isLoadingSeparacoes}
    - clientGroups count: ${Object.keys(ordersByClientData.clientGroups).length}
    - filteredGroups count: ${Object.keys(filteredGroups).length}
    - reported totalCount: ${ordersByClientData.totalCount}
    - search criteria active: ${isSearching ? 'yes' : 'no'}
    - search query: ${searchQuery || 'none'}
    - search type: ${searchType || 'none'}
    `);
    
    // Force a refresh if we detect a mismatch
    if (!isLoadingOrders && ordersByClientData.totalCount > 0 && 
        Object.keys(ordersByClientData.clientGroups).length < ordersByClientData.totalCount) {
      console.log("DIAGNOSTIC LOG: Detected mismatch in client count vs expected count. Will log detailed client info.");
    }
  }, [
    isLoadingOrders, isLoadingTotals, isLoadingSeparacoes, 
    ordersByClientData, filteredGroups, 
    isSearching, searchQuery, searchType
  ]);

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
    refetch,
  };
};
