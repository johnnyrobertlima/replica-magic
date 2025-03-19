
import { useState, useEffect, useCallback } from "react";
import { fetchBkFaturamentoData } from "@/services/bk/financialDataService";
import { consolidateByNota } from "@/services/bk/financialProcessingService";
import { ConsolidatedInvoice, FinancialTitle } from "@/services/bk/types/financialTypes";
import { format, subDays, isAfter, isBefore, isEqual, parseISO } from "date-fns";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface FinancialSummary {
  totalValoresVencidos: number;
  totalPago: number; 
  totalEmAberto: number;
}

export interface ClientFinancialSummary {
  PES_CODIGO: string;
  CLIENTE_NOME: string;
  totalValoresVencidos: number;
  totalPago: number;
  totalEmAberto: number;
}

export const useFinancial = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [consolidatedInvoices, setConsolidatedInvoices] = useState<ConsolidatedInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<ConsolidatedInvoice[]>([]);
  const [financialTitles, setFinancialTitles] = useState<FinancialTitle[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<FinancialTitle[]>([]);
  const [clientFinancialSummaries, setClientFinancialSummaries] = useState<ClientFinancialSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [clientFilter, setClientFilter] = useState<string>("");
  const [notaFilter, setNotaFilter] = useState<string>("");
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalValoresVencidos: 0,
    totalPago: 0,
    totalEmAberto: 0
  });
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
      
      // Apply initial filter for status
      const filtered = statusFilter === "all" 
        ? consolidated 
        : consolidated.filter(invoice => invoice.STATUS === statusFilter);
      
      setFilteredInvoices(filtered);
      
      // Extract unique statuses for filter
      const statuses = [...new Set(consolidated.map(invoice => invoice.STATUS || ""))];
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
    
    // Apply status filter directly
    if (status === "all") {
      setFilteredInvoices(consolidatedInvoices);
    } else {
      const filtered = consolidatedInvoices.filter(invoice => invoice.STATUS === status);
      setFilteredInvoices(filtered);
    }
  }, [consolidatedInvoices]);

  const updateClientFilter = useCallback((client: string) => {
    setClientFilter(client);
    applyFilters();
  }, []);

  const updateNotaFilter = useCallback((nota: string) => {
    setNotaFilter(nota);
    applyFilters();
  }, []);

  // Apply filters function
  const applyFilters = useCallback(() => {
    let filtered = [...consolidatedInvoices];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.STATUS === statusFilter);
    }
    
    // Apply client filter
    if (clientFilter) {
      const searchTerm = clientFilter.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.CLIENTE_NOME?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply nota filter
    if (notaFilter) {
      filtered = filtered.filter(invoice => 
        invoice.NOTA.includes(notaFilter)
      );
    }
    
    setFilteredInvoices(filtered);
  }, [statusFilter, clientFilter, notaFilter, consolidatedInvoices]);

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
    clientFilter,
    updateClientFilter,
    notaFilter,
    updateNotaFilter,
    financialSummary,
    clientFinancialSummaries
  };
};
