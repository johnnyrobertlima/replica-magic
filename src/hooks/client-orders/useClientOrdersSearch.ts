
import { useState, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import type { SearchType } from "@/components/jab-orders/SearchFilters";

export interface SearchState {
  date: DateRange | undefined;
  searchDate: DateRange | undefined;
  searchQuery: string;
  searchType: SearchType;
  isSearching: boolean;
}

export const useClientOrdersSearch = () => {
  // Set default date range to current month
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const defaultDateRange: DateRange = {
    from: firstDayOfMonth,
    to: lastDayOfMonth
  };

  const [date, setDate] = useState<DateRange | undefined>(defaultDateRange);
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(defaultDateRange);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("pedido");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setSearchDate(date);
    setIsSearching(true);
  };

  return {
    date,
    searchDate,
    searchQuery,
    searchType,
    isSearching,
    setDate,
    setSearchQuery,
    setSearchType,
    handleSearch
  };
};
