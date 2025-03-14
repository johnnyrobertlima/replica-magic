
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import type { SearchType } from "@/components/jab-orders/SearchFilters";

export interface SearchState {
  date: DateRange | undefined;
  searchDate: DateRange | undefined;
  searchQuery: string;
  searchType: SearchType;
  isSearching: boolean;
}

export const useClientOrdersSearch = (initialDate: DateRange | undefined = {
  from: new Date(),
  to: new Date(),
}) => {
  const [state, setState] = useState<SearchState>({
    date: initialDate,
    searchDate: initialDate,
    searchQuery: "",
    searchType: "pedido",
    isSearching: false,
  });

  // Destructure state for easier access
  const {
    date,
    searchDate,
    searchQuery,
    searchType,
    isSearching
  } = state;

  // State update methods
  const setDate = (newDate: DateRange | undefined) => {
    console.log("Setting new date:", newDate);
    setState(prev => ({ ...prev, date: newDate }));
  };

  const setSearchQuery = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const setSearchType = (type: SearchType) => {
    setState(prev => ({ ...prev, searchType: type }));
  };

  const handleSearch = () => {
    console.log("Handling search with date:", state.date);
    
    // Só atualizamos o searchDate se ele for diferente do date atual
    // para evitar re-renders desnecessários e potenciais loops
    if (JSON.stringify(state.date) !== JSON.stringify(state.searchDate)) {
      const newSearchDate = state.date ? { ...state.date } : undefined;
      
      setState(prev => ({ 
        ...prev, 
        isSearching: true,
        searchDate: newSearchDate
      }));
    } else {
      // Se a data for a mesma, apenas atualizamos isSearching
      if (!state.isSearching) {
        setState(prev => ({
          ...prev,
          isSearching: true
        }));
      }
    }
  };

  return {
    // State values
    date,
    searchDate,
    searchQuery,
    searchType,
    isSearching,
    // State update methods
    setDate,
    setSearchQuery,
    setSearchType,
    handleSearch
  };
};
