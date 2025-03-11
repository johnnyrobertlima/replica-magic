
import { useMemo } from "react";
import { useAllJabOrders, useTotals } from "@/hooks/useJabOrders";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { groupOrdersByClient, filterGroupsBySearchCriteria } from "@/utils/clientOrdersUtils";
import { useClientOrdersState } from "./client-orders/useClientOrdersState";
import { useItemSelection } from "./client-orders/useItemSelection";
import { useSeparationOperations } from "./client-orders/useSeparationOperations";
import type { JabOrdersResponse } from "@/types/jabOrders";

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
  const { data: ordersData = { orders: [], totalCount: 0, itensSeparacao: {} } as JabOrdersResponse, isLoading: isLoadingOrders } = useAllJabOrders({
    dateRange: searchDate
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useTotals();

  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes();

  // Create a full response object with default empty itensSeparacao if not provided
  const fullOrdersData = useMemo(() => ({
    ...ordersData,
    itensSeparacao: ordersData.itensSeparacao || {}
  }), [ordersData]);

  // Group orders by client
  const groupedOrders = useMemo(() => groupOrdersByClient(fullOrdersData), [fullOrdersData]);

  // Filter groups by search criteria - mapping the searchType to correct expected value
  const filteredGroups = useMemo(() => {
    // Map searchType to the expected value in the filterGroupsBySearchCriteria function
    let mappedSearchType = searchType;
    if (searchType === 'cliente') mappedSearchType = 'client';
    
    // Filter groups based on the mapped search type
    return filterGroupsBySearchCriteria(
      groupedOrders, 
      isSearching, 
      searchQuery, 
      mappedSearchType as 'pedido' | 'item' | 'client'
    );
  }, [groupedOrders, isSearching, searchQuery, searchType]);

  // Use the item selection hook
  const {
    totalSelecionado,
    handleItemSelect,
    exportSelectedItemsToExcel
  } = useItemSelection(state, setState, filteredGroups);

  // Use the separation operations hook
  const {
    handleEnviarParaSeparacao
  } = useSeparationOperations(state, setState, groupedOrders);

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
    ordersData: fullOrdersData,
    totals,
    separacoes,
    filteredGroups,
    totalSelecionado,
    // Loading states
    isLoading: isLoadingOrders || isLoadingTotals || isLoadingSeparacoes,
    // Methods
    toggleExpand,
    handleSearch,
    handleItemSelect,
    handleEnviarParaSeparacao,
    exportSelectedItemsToExcel,
  };
};
