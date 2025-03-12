
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchTitulosVencidos } from "@/utils/financialUtils";

export const useClientOrderCard = (data: any) => {
  const [valoresVencidos, setValoresVencidos] = useState(0);
  const [valoresEmAberto, setValoresEmAberto] = useState(0);
  const [valoresTotais, setValoresTotais] = useState(0);
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(false);
  const { toast } = useToast();

  const pedidosCount = useMemo(() => 
    new Set(data.allItems.map((item: any) => item.pedido)).size,
  [data.allItems]);

  const financialData = useMemo(() => {
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
        : 0
    };
  }, [data.totalValorPedido, data.totalValorFaturado, data.totalValorSaldo, data.totalValorFaturarComEstoque]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!data.PES_CODIGO) return;
      
      setIsLoadingFinancial(true);
      try {
        const overdue = await fetchTitulosVencidos(data.PES_CODIGO);
        setValoresVencidos(overdue);
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
