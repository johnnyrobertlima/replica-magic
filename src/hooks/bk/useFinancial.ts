
import { useState, useEffect } from "react";
import { fetchBkFaturamentoData, consolidateByNota, BkFaturamento } from "@/services/bk/financialService";
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
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: getDateXDaysAgo(30), // Default to 30 days ago
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchBkFaturamentoData(dateRange.startDate, dateRange.endDate);
      setFaturamentoData(data);
      
      // Consolidate invoices by NOTA
      const consolidated = consolidateByNota(data);
      setConsolidatedInvoices(consolidated);
      
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

  const updateDateRange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  return {
    isLoading,
    faturamentoData,
    consolidatedInvoices,
    error,
    refreshData,
    dateRange,
    updateDateRange
  };
};
