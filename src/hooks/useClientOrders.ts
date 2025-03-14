
import { useMemo, useEffect, useState } from "react";
import { useAllJabOrders, useTotals } from "@/hooks/useJabOrders";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { groupOrdersByClient, filterGroupsBySearchCriteria } from "@/utils/clientOrdersUtils";
import { enhanceGroupsWithRepresentanteNames } from "@/utils/representativeUtils";
import { useClientOrdersState } from "./client-orders/useClientOrdersState";
import { useItemSelection } from "./client-orders/useItemSelection";
import { useSeparationOperations } from "./client-orders/useSeparationOperations";
import { ClientOrderGroup } from "@/types/clientOrders";

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

  // Data fetching hooks
  const { data: ordersData = { orders: [], totalCount: 0, itensSeparacao: {} }, isLoading: isLoadingOrders } = useAllJabOrders({
    dateRange: searchDate
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();

  // State to hold the processed groups
  const [processedGroups, setProcessedGroups] = useState<Record<string, ClientOrderGroup>>({});
  const [isProcessingGroups, setIsProcessingGroups] = useState(false);

  // Group orders by client and process them
  useEffect(() => {
    if (!ordersData || !ordersData.orders || ordersData.orders.length === 0) {
      setProcessedGroups({});
      return;
    }
    
    console.log(`Processando ${ordersData.orders.length} pedidos para criar grupos de clientes`);
    
    const processGroups = async () => {
      try {
        setIsProcessingGroups(true);
        
        // First group the orders by client - now this is async to fetch overdue data
        const groups = await groupOrdersByClient(ordersData);
        
        // Then enhance the groups with representative names
        const enhancedGroups = await enhanceGroupsWithRepresentanteNames(groups);
        
        // Store the processed groups in state
        setProcessedGroups(enhancedGroups);
      } catch (error) {
        console.error("Erro ao processar grupos de pedidos:", error);
        setProcessedGroups({});
      } finally {
        setIsProcessingGroups(false);
      }
    };
    
    processGroups();
  }, [ordersData]);

  // Filter groups by search criteria
  const filteredGroups = useMemo(() => 
    filterGroupsBySearchCriteria(processedGroups, isSearching, searchQuery, searchType), 
    [processedGroups, isSearching, searchQuery, searchType]
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
  } = useSeparationOperations(state, setState, processedGroups);

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
    ordersData,
    totals,
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
  };
};
