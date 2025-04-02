
import React from "react";
import { DateRange } from "@/hooks/bluebay_adm/useStockSalesAnalytics";
import { DateRangeFilterSection } from "./filters/DateRangeFilterSection";
import { ActionButtons } from "./filters/ActionButtons";
import { SearchFilter } from "./filters/SearchFilter";
import { GroupFilter } from "./filters/GroupFilter";
import { AdditionalFilters } from "./filters/AdditionalFilters";

interface StockSalesFiltersProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  groupFilter: string;
  onGroupFilterChange: (value: string) => void;
  availableGroups: string[];
  onRefresh: () => void;
  onClearFilters: () => void;
  isLoading: boolean;
  minCadastroYear: string;
  onMinCadastroYearChange: (value: string) => void;
  showZeroStock: boolean;
  onShowZeroStockChange: (value: boolean) => void;
}

export const StockSalesFilters: React.FC<StockSalesFiltersProps> = ({
  dateRange,
  onDateRangeChange,
  searchTerm,
  onSearchChange,
  groupFilter,
  onGroupFilterChange,
  availableGroups,
  onRefresh,
  onClearFilters,
  isLoading,
  minCadastroYear,
  onMinCadastroYearChange,
  showZeroStock,
  onShowZeroStockChange
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <DateRangeFilterSection 
          dateRange={dateRange} 
          onDateRangeChange={onDateRangeChange} 
        />
        
        <ActionButtons 
          onRefresh={onRefresh} 
          onClearFilters={onClearFilters} 
          isLoading={isLoading} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SearchFilter 
          searchTerm={searchTerm} 
          onSearchChange={onSearchChange} 
        />
        
        <GroupFilter 
          groupFilter={groupFilter} 
          onGroupFilterChange={onGroupFilterChange} 
          availableGroups={availableGroups} 
        />
      </div>
      
      <AdditionalFilters 
        minCadastroYear={minCadastroYear}
        onMinCadastroYearChange={onMinCadastroYearChange}
        showZeroStock={showZeroStock}
        onShowZeroStockChange={onShowZeroStockChange}
      />
    </div>
  );
};
