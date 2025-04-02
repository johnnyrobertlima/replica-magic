
import React from "react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "@/hooks/bluebay_adm/useStockSalesAnalytics";

interface DateRangeFilterSectionProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export const DateRangeFilterSection: React.FC<DateRangeFilterSectionProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <div className="flex-1">
      <DatePickerWithRange
        dateRange={{
          from: dateRange.startDate,
          to: dateRange.endDate
        }}
        onDateRangeChange={(range) => {
          onDateRangeChange({
            startDate: range.from,
            endDate: range.to
          });
        }}
        className="w-full"
      />
    </div>
  );
};
