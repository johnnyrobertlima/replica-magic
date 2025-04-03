
import React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "@/hooks/bluebay_adm/stock-sales/useStockSalesFilters";

interface DateRangeFilterSectionProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

export const DateRangeFilterSection: React.FC<DateRangeFilterSectionProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Período de Venda</h3>
      <DatePickerWithRange 
        dateRange={dateRange} 
        onDateRangeChange={onDateRangeChange} 
      />
    </div>
  );
};
