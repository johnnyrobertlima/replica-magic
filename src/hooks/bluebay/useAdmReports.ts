
import { useState, useEffect } from "react";
import { EstoqueItem } from "@/types/bk/estoque";
import { fetchReportItems } from "@/services/bluebay_adm/reportsService";
import { useToast } from "@/hooks/use-toast";

export const useAdmReports = () => {
  const [items, setItems] = useState<EstoqueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadReportItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchReportItems();
      setItems(data);
    } catch (err) {
      console.error("Error loading report items:", err);
      setError("Falha ao carregar items do relatório");
      toast({
        title: "Erro",
        description: "Falha ao carregar itens do relatório. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportItems();
  }, []);

  const refreshData = () => {
    loadReportItems();
  };

  return {
    items,
    isLoading,
    error,
    refreshData
  };
};
