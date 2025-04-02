
import { useState } from "react";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export const useStockSalesFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [minCadastroYear, setMinCadastroYear] = useState("2022");
  const [showZeroStock, setShowZeroStock] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  
  const updateAvailableGroups = (items: any[]) => {
    if (items.length > 0) {
      const groups = [...new Set(items.map(item => item.GRU_DESCRICAO).filter(Boolean))];
      setAvailableGroups(groups.sort());
    } else {
      setAvailableGroups([]);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setGroupFilter("all");
    setMinCadastroYear("2022");
    setShowZeroStock(false);
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
