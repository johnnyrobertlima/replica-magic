
import { useState } from "react";
import type { ClientOrdersState } from "@/types/clientOrders";
import type { DateRange } from "react-day-picker";
import type { SearchType } from "@/components/jab-orders/SearchFilters";

export const useClientOrdersState = () => {
  const [state, setState] = useState<ClientOrdersState>({
    date: {
      from: new Date(),
      to: new Date(),
    },
    searchDate: {
      from: new Date(),
      to: new Date(),
    },
    expandedClients: new Set<string>(),
    searchQuery: "",
    searchType: "pedido",
    isSearching: false,
    showZeroBalance: false,
    showOnlyWithStock: false,
    selectedItems: [],
    selectedItemsDetails: {},
    isSending: false
  });

  // Destructure state for easier access
  const {
    date,
    expandedClients,
    searchQuery,
    searchType,
    showZeroBalance,
    showOnlyWithStock,
    selectedItems,
    selectedItemsDetails,
    isSending
  } = state;

  // State update methods
  const setDate = (newDate: DateRange | undefined) => {
    setState(prev => ({ ...prev, date: newDate }));
  };

  const setSearchQuery = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const setSearchType = (type: SearchType) => {
    setState(prev => ({ ...prev, searchType: type }));
  };

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

  const handleSearch = () => {
    setState(prev => ({ 
      ...prev, 
      isSearching: true,
      searchDate: prev.date
    }));
  };

  return {
    state,
    setState,
    // State values
    date,
    expandedClients,
    searchQuery,
    searchType,
    showZeroBalance,
    showOnlyWithStock,
    selectedItems,
    selectedItemsDetails,
    isSending,
    // State update methods
    setDate,
    setSearchQuery,
    setSearchType,
    setShowZeroBalance,
    setShowOnlyWithStock,
    toggleExpand,
    handleSearch
  };
};
