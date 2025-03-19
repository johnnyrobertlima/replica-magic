
import { useState, useCallback } from "react";
import { fetchBkFaturamentoData } from "@/services/bk/financialDataService";
import { consolidateByNota } from "@/services/bk/financialProcessingService";
import { format, subDays } from "date-fns";
import { ConsolidatedInvoice, FinancialTitle } from "@/services/bk/types/financialTypes";
import { DateRange } from "./types";

export const useFinancialData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [consolidatedInvoices, setConsolidatedInvoices] = useState<ConsolidatedInvoice[]>([]);
  const [financialTitles, setFinancialTitles] = useState<FinancialTitle[]>([]);
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

      // Fetch faturamento data with date filtering
      const faturamentoData = await fetchBkFaturamentoData(
        startDateFormatted,
        endDateFormatted
      );
      
      // Process and consolidate invoices by nota
      const consolidated = consolidateByNota(faturamentoData);
      setConsolidatedInvoices(consolidated);
      
      // Extract unique statuses for filter
      const statuses = [...new Set(consolidated.map(invoice => invoice.STATUS || ""))];
      setAvailableStatuses(['all', ...statuses.filter(status => status !== "")]);
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  const updateDateRange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
  }, []);

  return {
    isLoading,
    consolidatedInvoices,
    financialTitles,
    availableStatuses,
    dateRange,
    updateDateRange,
    refreshData,
  };
};
