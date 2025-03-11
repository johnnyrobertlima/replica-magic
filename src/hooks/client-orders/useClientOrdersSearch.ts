
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import type { SearchType } from "@/types/searchTypes";

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
    setState(prev => ({ ...prev, date: newDate }));
  };

  const setSearchQuery = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const setSearchType = (type: SearchType) => {
    setState(prev => ({ ...prev, searchType: type }));
  };

  const handleSearch = () => {
    setState(prev => ({ 
      ...prev, 
      isSearching: true,
      searchDate: prev.date
    }));
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
