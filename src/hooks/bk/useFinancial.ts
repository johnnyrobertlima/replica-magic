
import { useState, useEffect, useMemo } from "react";
import { 
  fetchBkFaturamentoData, 
  consolidateByNota, 
  BkFaturamento 
} from "@/services/bk/financialService";
import { useToast } from "@/hooks/use-toast";

// Helper to get date from X days ago in ISO format
const getDateXDaysAgo = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const useFinancial = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [faturamentoData, setFaturamentoData] = useState<BkFaturamento[]>([]);
  const [consolidatedInvoices, setConsolidatedInvoices] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: getDateXDaysAgo(30), // Default to 30 days ago
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const { toast } = useToast();

  // Extract unique statuses from consolidated invoices
  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    consolidatedInvoices.forEach(invoice => {
      if (invoice.STATUS !== null) {
        statuses.add(invoice.STATUS);
      }
    });
    return Array.from(statuses);
  }, [consolidatedInvoices]);

  // Filter invoices by status
  const filteredInvoices = useMemo(() => {
    if (statusFilter === "all") {
      return consolidatedInvoices;
    }
    return consolidatedInvoices.filter(invoice => invoice.STATUS === statusFilter);
  }, [consolidatedInvoices, statusFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Loading financial data for date range: ${dateRange.startDate} to ${dateRange.endDate}`);
      
      // Fetch data using the database function with correct join
      const data = await fetchBkFaturamentoData(dateRange.startDate, dateRange.endDate);
      console.log(`Received ${data.length} raw records from database`);
      setFaturamentoData(data);
      
      // Consolidate invoices by NOTA
      const consolidated = consolidateByNota(data);
      console.log(`Consolidated into ${consolidated.length} invoice records`);
      setConsolidatedInvoices(consolidated);
      
      console.log("Data loaded with correction factors:", consolidated);
      
    } catch (err) {
      console.error("Error loading financial data:", err);
      setError("Failed to load financial data");
      toast({
        title: "Error",
        description: "Failed to load financial data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange.startDate, dateRange.endDate]);

  const refreshData = () => {
    loadData();
  };

  // Only update the date range without resetting other filters
  const updateDateRange = (startDate: string, endDate: string) => {
    console.log(`Updating date range to: ${startDate} - ${endDate}`);
    setDateRange({ startDate, endDate });
    // We don't reset the status filter here anymore
  };

  const updateStatusFilter = (status: string) => {
    setStatusFilter(status);
  };

  return {
    isLoading,
    faturamentoData,
    consolidatedInvoices,
    filteredInvoices,
    error,
    refreshData,
    dateRange,
    updateDateRange,
    statusFilter,
    updateStatusFilter,
    availableStatuses
  };
};
