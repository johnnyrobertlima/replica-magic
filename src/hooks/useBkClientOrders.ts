
import { useAllBkOrders, useBkTotals } from "@/hooks/useBkOrders";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { useClientOrdersState } from "./client-orders/useClientOrdersState";
import { useItemSelection } from "./client-orders/useItemSelection";
import { useSeparationOperations } from "./client-orders/useSeparationOperations";
import { useBkOrderStatuses } from "./bk/useBkOrderStatuses";
import { useBkGroupProcessing } from "./bk/useBkGroupProcessing";
import { useBkGroupFiltering } from "./bk/useBkGroupFiltering";
import { useBkPeriodTotals } from "./bk/useBkPeriodTotals";

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
  const { selectedStatuses, setSelectedStatuses, handleStatusChange } = useBkOrderStatuses();

  // Data fetching hooks
  const { data: ordersData = { orders: [], totalCount: 0, itensSeparacao: {} }, isLoading: isLoadingOrders } = useAllBkOrders({
    dateRange: searchDate
  });

  const { data: totals = { valorTotalSaldo: 0, valorFaturarComEstoque: 0 }, isLoading: isLoadingTotals } = useBkTotals();

  const { data: separacoes = [], isLoading: isLoadingSeparacoes } = useSeparacoes('BK');

  // Process groups
  const { processedGroups, isProcessingGroups } = useBkGroupProcessing(ordersData);

  // Filter groups
  const filteredGroups = useBkGroupFiltering(
    processedGroups,
    isSearching,
    searchQuery,
    searchType,
    selectedStatuses
  );

  // Calculate period totals
  const periodTotals = useBkPeriodTotals(filteredGroups);

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
    handleStatusChange,
  };
};
