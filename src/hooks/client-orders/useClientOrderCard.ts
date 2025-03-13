
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchTitulosVencidos } from "@/utils/financialUtils";

// Define a proper type for financial data
interface FinancialData {
  progressFaturamento: number;
  progressPotencial: number;
  valoresTotais: number;
  valoresEmAberto: number;
}

export const useClientOrderCard = (data: any) => {
  const [valoresVencidos, setValoresVencidos] = useState(0);
  const [valoresEmAberto, setValoresEmAberto] = useState(0);
  const [valoresTotais, setValoresTotais] = useState(0);
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(false);
  const { toast } = useToast();

  // Calculate how many unique pedidos we have for this client
  const pedidosCount = useMemo(() => 
    data.uniquePedidosCount || new Set(data.allItems.map((item: any) => item.pedido)).size,
  [data.allItems, data.uniquePedidosCount]);

  const financialData = useMemo((): FinancialData => {
    const totalValorPedido = data.totalValorPedido || 0;
    const totalValorFaturado = data.totalValorFaturado || 0;
    const totalValorSaldo = data.totalValorSaldo || 0;
    const totalValorFaturarComEstoque = data.totalValorFaturarComEstoque || 0;
    
    return {
      progressFaturamento: totalValorPedido > 0 
        ? (totalValorFaturado / totalValorPedido) * 100 
        : 0,
      progressPotencial: totalValorSaldo > 0 
        ? (totalValorFaturarComEstoque / totalValorSaldo) * 100 
        : 0,
      valoresTotais: totalValorPedido,
      valoresEmAberto: totalValorSaldo
    };
  }, [data.totalValorPedido, data.totalValorFaturado, data.totalValorSaldo, data.totalValorFaturarComEstoque]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!data.PES_CODIGO) return;
      
      setIsLoadingFinancial(true);
      try {
        // We want to fetch valores vencidos independently of the date filter
        // This data should always be current, regardless of the date range selection
        const overdue = await fetchTitulosVencidos(data.PES_CODIGO);
        setValoresVencidos(overdue);
        
        // These values are date-dependent and come from the filtered order data
        setValoresTotais(financialData.valoresTotais);
        setValoresEmAberto(financialData.valoresEmAberto);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar dados financeiros",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFinancial(false);
      }
    };

    fetchFinancialData();
  }, [data.PES_CODIGO, financialData.valoresTotais, financialData.valoresEmAberto, toast]);

  return {
    valoresVencidos,
    valoresEmAberto,
    valoresTotais,
    isLoadingFinancial,
    pedidosCount,
    financialData
  };
};
