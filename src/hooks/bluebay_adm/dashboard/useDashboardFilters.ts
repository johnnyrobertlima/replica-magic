
import { useState, useEffect } from "react";
import { fetchFilterOptions } from "@/services/bluebay/filtersService";

export interface FilterOptions {
  brands: Array<{ value: string; label: string }>;
  representatives: Array<{ value: string; label: string }>;
  statuses: Array<{ value: string; label: string }>;
}

export const useDashboardFilters = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    brands: [],
    representatives: [],
    statuses: []
  });

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setIsLoading(true);
        const options = await fetchFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  return {
    isLoading,
    filterOptions
  };
};
