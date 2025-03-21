
import React from "react";
import { DateRangePicker } from "@/components/bk/financial/DateRangePicker";
import { StatusFilter } from "@/components/bk/financial/StatusFilter";
import { AdditionalFilters } from "@/components/bk/financial/AdditionalFilters";
import { DateRange } from "@/hooks/bk/financial/types";

interface FinancialFiltersProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  statuses: string[];
  clientFilter: string;
  onClientFilterChange: (value: string) => void;
  notaFilter: string;
  onNotaFilterChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeUpdate: (dateRange: DateRange) => void;
}

export const FinancialFilters: React.FC<FinancialFiltersProps> = ({
  statusFilter,
  onStatusChange,
  statuses,
  clientFilter,
  onClientFilterChange,
  notaFilter,
  onNotaFilterChange,
  dateRange,
  onDateRangeUpdate
}) => {
  return (
    <div className="flex flex-wrap justify-between gap-4 mb-4 items-start">
      <div className="space-y-4 w-full md:w-auto">
        <StatusFilter 
          selectedStatus={statusFilter} 
          onStatusChange={onStatusChange}
          statuses={statuses}
        />
        <AdditionalFilters 
          clientFilter={clientFilter}
          onClientFilterChange={onClientFilterChange}
          notaFilter={notaFilter}
          onNotaFilterChange={onNotaFilterChange}
        />
      </div>
      
      <DateRangePicker 
        startDate={dateRange.startDate} 
        endDate={dateRange.endDate} 
        onUpdate={onDateRangeUpdate}
        label="Período de Vencimento"
      />
    </div>
  );
};
