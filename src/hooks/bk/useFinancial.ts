
import { useState, useEffect } from "react";
import { fetchBkFaturamentoData, consolidateByNota, BkFaturamento } from "@/services/bk/financialService";
import { useToast } from "@/hooks/use-toast";

export const useFinancial = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [faturamentoData, setFaturamentoData] = useState<BkFaturamento[]>([]);
  const [consolidatedInvoices, setConsolidatedInvoices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchBkFaturamentoData();
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
  }, []);

  const refreshData = () => {
    loadData();
  };

  return {
    isLoading,
    faturamentoData,
    consolidatedInvoices,
    error,
    refreshData
  };
};
