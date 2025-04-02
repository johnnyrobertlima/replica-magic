
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export const useStockSalesFilters = () => {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [minCadastroYear, setMinCadastroYear] = useState("all");
  const [showZeroStock, setShowZeroStock] = useState(true); // Set to true to show all items by default

  // Initialize available groups from items
  const updateAvailableGroups = (items: any[]) => {
    if (!items || items.length === 0) {
      setAvailableGroups([]);
      return;
    }

    const groups = new Set<string>();
    
    items.forEach(item => {
      if (item.GRU_DESCRICAO) {
        groups.add(item.GRU_DESCRICAO);
      }
    });
    
    const sortedGroups = Array.from(groups).sort((a, b) => a.localeCompare(b));
    setAvailableGroups(sortedGroups);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setGroupFilter("all");
    setMinCadastroYear("all");
    setShowZeroStock(true); // Reset to show all items
  };

  return {
    searchTerm,
    setSearchTerm,
    groupFilter,
    setGroupFilter,
    minCadastroYear,
    setMinCadastroYear,
    showZeroStock,
    setShowZeroStock,
    availableGroups,
    updateAvailableGroups,
    clearFilters
  };
};
