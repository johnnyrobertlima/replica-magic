
import { useState, useEffect, useCallback } from "react";
import { fetchFinancialTitles } from "@/services/bk/titleService";
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

export const useFinancial = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [consolidatedInvoices, setConsolidatedInvoices] = useState<ConsolidatedInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<ConsolidatedInvoice[]>([]);
  const [financialTitles, setFinancialTitles] = useState<FinancialTitle[]>([]);
  const [filteredTitles, setFilteredTitles] = useState<FinancialTitle[]>([]);
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

      const titles = await fetchFinancialTitles(
        startDateFormatted,
        endDateFormatted,
        statusFilter === "all" ? undefined : statusFilter
      );

      setFinancialTitles(titles);
      
      // Extract unique statuses for filter
      const statuses = [...new Set(titles.map(title => title.STATUS || ""))];
      setAvailableStatuses(['all', ...statuses.filter(status => status !== "")]);

      // Calculate financial summary
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      let valoresVencidos = 0;
      let valoresPagos = 0;
      let valoresEmAberto = 0;

      titles.forEach(title => {
        // Para valores vencidos: títulos com data de vencimento anterior a hoje e com saldo
        if (title.DTVENCIMENTO && title.VLRSALDO) {
          const dataVencimento = new Date(title.DTVENCIMENTO);
          dataVencimento.setHours(0, 0, 0, 0);

          if (isBefore(dataVencimento, hoje) && title.VLRSALDO > 0) {
            valoresVencidos += title.VLRSALDO;
          }

          // Para valores em aberto: títulos com data de vencimento hoje ou posterior
          if ((isEqual(dataVencimento, hoje) || isAfter(dataVencimento, hoje)) && title.VLRSALDO > 0) {
            valoresEmAberto += title.VLRSALDO;
          }
        }

        // Para valores pagos: títulos com status "3" (Pago)
        if (title.STATUS === "3" && title.VLRTITULO) {
          valoresPagos += title.VLRTITULO;
        }
      });

      setFinancialSummary({
        totalValoresVencidos: valoresVencidos,
        totalPago: valoresPagos,
        totalEmAberto: valoresEmAberto
      });

      // Initial filter application
      applyFilters(titles);

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

  const updateClientFilter = useCallback((client: string) => {
    setClientFilter(client);
  }, []);

  const updateNotaFilter = useCallback((nota: string) => {
    setNotaFilter(nota);
  }, []);

  // Apply filters function
  const applyFilters = useCallback((titles: FinancialTitle[]) => {
    let filtered = [...titles];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(title => title.STATUS === statusFilter);
    }
    
    // Apply client filter
    if (clientFilter) {
      const searchTerm = clientFilter.toLowerCase();
      filtered = filtered.filter(title => 
        title.CLIENTE_NOME?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply nota filter
    if (notaFilter) {
      filtered = filtered.filter(title => 
        title.NUMNOTA?.toString().includes(notaFilter)
      );
    }
    
    setFilteredTitles(filtered);
  }, [statusFilter, clientFilter, notaFilter]);

  // Effect to apply filters when any filter changes
  useEffect(() => {
    if (financialTitles.length > 0) {
      applyFilters(financialTitles);
    }
  }, [financialTitles, statusFilter, clientFilter, notaFilter, applyFilters]);

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
    financialSummary
  };
};
