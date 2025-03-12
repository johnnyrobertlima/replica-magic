
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
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [searchDate, setSearchDate] = useState<DateRange | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("cliente");
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
