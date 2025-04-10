
import { useState, useEffect, useCallback } from "react";

export const useItemFilters = (refreshItems: (search: string, group: string) => void) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");

  // Add debounce for search and filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshItems(searchTerm, groupFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, groupFilter, refreshItems]);

  return {
    searchTerm,
    setSearchTerm,
    groupFilter,
    setGroupFilter,
  };
};
