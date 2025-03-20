
import { useAllBkOrders, useBkTotals } from "@/hooks/useBkOrders";
import { useSeparacoes } from "@/hooks/useSeparacoes";
import { useClientOrdersState } from "./client-orders/useClientOrdersState";
import { useItemSelection } from "./client-orders/useItemSelection";
import { useSeparationOperations } from "./client-orders/useSeparationOperations";
import { useBkOrderStatuses } from "./bk/useBkOrderStatuses";
import { useBkGroupProcessing } from "./bk/useBkGroupProcessing";
import { useBkGroupFiltering } from "./bk/useBkGroupFiltering";
import { useBkPeriodTotals } from "./bk/useBkPeriodTotals";
import { useBkFilteredTotals } from "./bk/useBkFilteredTotals";
import { useUserRepresentante } from "./bk/useUserRepresentante";

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

  // Check if user is a representante and get their code
  const { isRepresentanteBK, representanteCodigo, representanteNome, isLoading: isLoadingRepresentante, error: representanteError } = useUserRepresentante();

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
    selectedStatuses,
    isRepresentanteBK ? representanteCodigo : null
  );

  // Calculate period totals
  const periodTotals = useBkPeriodTotals(filteredGroups);
  
  // Calculate new filtered totals
  const filteredTotals = useBkFilteredTotals(filteredGroups);

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
    ...periodTotals,
    ...filteredTotals
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
    // Representante info
    isRepresentanteBK,
    representanteCodigo,
    representanteNome,
    error: representanteError,
    // Data
    ordersData,
    totals: combinedTotals,
    separacoes,
    filteredGroups,
    totalSelecionado,
    // Loading states
    isLoading: isLoadingOrders || isLoadingTotals || isLoadingSeparacoes || isProcessingGroups || isLoadingRepresentante,
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
