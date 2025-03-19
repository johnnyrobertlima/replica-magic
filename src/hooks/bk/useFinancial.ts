
import { useState, useEffect, useCallback } from "react";
import { fetchFinancialTitles } from "@/services/bk/titleService";
import { ConsolidatedInvoice, FinancialTitle } from "@/services/bk/types/financialTypes";
import { format, subDays } from "date-fns";

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export const useFinancial = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [consolidatedInvoices, setConsolidatedInvoices] = useState<ConsolidatedInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<ConsolidatedInvoice[]>([]);
  const [financialTitles, setFinancialTitles] = useState<FinancialTitle[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<FinancialTitle[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Format dates for API request
      const startDateFormatted = dateRange.startDate 
        ? format(dateRange.startDate, 'yyyy-MM-dd') 
        : undefined;
      
      const endDateFormatted = dateRange.endDate
        ? format(dateRange.endDate, 'yyyy-MM-dd')
        : undefined;

      const titles = await fetchFinancialTitles(
        startDateFormatted,
        endDateFormatted,
        statusFilter === "all" ? undefined : statusFilter
      );

      setFinancialTitles(titles);
      setFilteredTitles(titles);

      // Extract unique statuses for filter
      const statuses = [...new Set(titles.map(title => title.STATUS || ""))];
      setAvailableStatuses(['all', ...statuses.filter(status => status !== "")]);

    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, statusFilter]);

  const updateDateRange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
  }, []);

  const updateStatusFilter = useCallback((status: string) => {
    setStatusFilter(status);
  }, []);

  // Apply filters
  useEffect(() => {
    if (financialTitles.length > 0) {
      let filtered = [...financialTitles];
      
      // Apply status filter
      if (statusFilter !== "all") {
        filtered = filtered.filter(title => title.STATUS === statusFilter);
      }
      
      setFilteredTitles(filtered);
    }
  }, [financialTitles, statusFilter]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    isLoading,
    consolidatedInvoices,
    filteredInvoices,
    financialTitles,
    filteredTitles,
    refreshData,
    dateRange,
    updateDateRange,
    statusFilter,
    updateStatusFilter,
    availableStatuses,
  };
};
