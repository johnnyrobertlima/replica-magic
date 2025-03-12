
import { useMemo, useEffect, useState } from "react";
import { useAllJabOrders, useTotals } from "@/hooks/useJabOrders";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { groupOrdersByClient, filterGroupsBySearchCriteria } from "@/utils/clientOrdersUtils";
import { useClientOrdersState } from "./client-orders/useClientOrdersState";
import { useItemSelection } from "./client-orders/useItemSelection";
import { useSeparationOperations } from "./client-orders/useSeparationOperations";
import { fetchClientFinancialInfo } from "@/services/jab-orders";
import { ClientOrderGroup } from "@/types/clientOrders";
import { JabOrdersResponse } from "@/types/jabOrders";

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

  // Group orders by client
  const groupedOrders = useMemo(() => groupOrdersByClient(ordersData), [ordersData]);
  
  // State to store grouped orders with financial information
  const [groupedOrdersWithFinancialInfo, setGroupedOrdersWithFinancialInfo] = useState<Record<string, ClientOrderGroup>>(groupedOrders);
  const [isLoadingFinancialInfo, setIsLoadingFinancialInfo] = useState(false);
  
  // Fetch financial information when grouped orders change
  useEffect(() => {
    const getFinancialInfo = async () => {
      if (!groupedOrders || Object.keys(groupedOrders).length === 0) return;
      
      setIsLoadingFinancialInfo(true);
      try {
        const ordersWithFinancialInfo = await fetchClientFinancialInfo(groupedOrders);
        setGroupedOrdersWithFinancialInfo(ordersWithFinancialInfo);
      } catch (error) {
        console.error("Erro ao buscar informações financeiras:", error);
      } finally {
        setIsLoadingFinancialInfo(false);
      }
    };
    
    getFinancialInfo();
  }, [groupedOrders]);

  // Filter groups by search criteria using the enhanced data
  const filteredGroups = useMemo(() => 
    filterGroupsBySearchCriteria(groupedOrdersWithFinancialInfo, isSearching, searchQuery, searchType), 
    [groupedOrdersWithFinancialInfo, isSearching, searchQuery, searchType]
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
    ordersData,
    totals,
    separacoes,
    filteredGroups,
    totalSelecionado,
    // Loading states
    isLoading: isLoadingOrders || isLoadingTotals || isLoadingSeparacoes || isLoadingFinancialInfo,
    // Methods
    toggleExpand,
    handleSearch,
    handleItemSelect,
    handleEnviarParaSeparacao,
    exportSelectedItemsToExcel,
  };
};
