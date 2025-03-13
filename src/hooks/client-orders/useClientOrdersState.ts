
import { useState } from "react";
import type { ClientOrdersState } from "@/types/clientOrders";
import { useClientOrdersSearch } from "./useClientOrdersSearch";

export const useClientOrdersState = () => {
  const searchState = useClientOrdersSearch();

  const [state, setState] = useState<Omit<ClientOrdersState, 'date' | 'searchDate' | 'searchQuery' | 'searchType' | 'isSearching'>>({
    expandedClients: new Set<string>(),
    showZeroBalance: false,
    showOnlyWithStock: false,
    selectedItems: [],
    selectedItemsDetails: {},
    isSending: false
  });

  // Destructure state for easier access
  const {
    expandedClients,
    showZeroBalance,
    showOnlyWithStock,
    selectedItems,
    selectedItemsDetails,
    isSending
  } = state;

  // State update methods
  const setShowZeroBalance = (show: boolean) => {
    setState(prev => ({ ...prev, showZeroBalance: show }));
  };

  const setShowOnlyWithStock = (show: boolean) => {
    setState(prev => ({ ...prev, showOnlyWithStock: show }));
  };

  const toggleExpand = (clientName: string) => {
    setState(prev => {
      const newSet = new Set(prev.expandedClients);
      if (newSet.has(clientName)) {
        newSet.delete(clientName);
      } else {
        newSet.add(clientName);
      }
      return { ...prev, expandedClients: newSet };
    });
  };

  // Create a combined state object to maintain compatibility with existing code
  const combinedState: ClientOrdersState = {
    ...searchState,
    ...state
  };

  return {
    state: combinedState,
    setState: (updater: React.SetStateAction<ClientOrdersState>) => {
      if (typeof updater === 'function') {
        const newState = updater(combinedState);
        // Update search state
        if (newState.date !== searchState.date) searchState.setDate(newState.date);
        if (newState.searchQuery !== searchState.searchQuery) searchState.setSearchQuery(newState.searchQuery);
        if (newState.searchType !== searchState.searchType) searchState.setSearchType(newState.searchType);
        
        // Update local state
        setState(prev => ({
          ...prev,
          expandedClients: newState.expandedClients,
          showZeroBalance: newState.showZeroBalance,
          showOnlyWithStock: newState.showOnlyWithStock,
          selectedItems: newState.selectedItems,
          selectedItemsDetails: newState.selectedItemsDetails,
          isSending: newState.isSending
        }));
      } else {
        // Update search state
        if (updater.date !== searchState.date) searchState.setDate(updater.date);
        if (updater.searchQuery !== searchState.searchQuery) searchState.setSearchQuery(updater.searchQuery);
        if (updater.searchType !== searchState.searchType) searchState.setSearchType(updater.searchType);
        
        // Update local state
        setState({
          expandedClients: updater.expandedClients,
          showZeroBalance: updater.showZeroBalance,
          showOnlyWithStock: updater.showOnlyWithStock,
          selectedItems: updater.selectedItems,
          selectedItemsDetails: updater.selectedItemsDetails,
          isSending: updater.isSending
        });
      }
    },
    // Search state values and methods (spread from searchState)
    ...searchState,
    // State values
    expandedClients,
    showZeroBalance,
    showOnlyWithStock,
    selectedItems,
    selectedItemsDetails,
    isSending,
    // State update methods
    setShowZeroBalance,
    setShowOnlyWithStock,
    toggleExpand
  };
};
