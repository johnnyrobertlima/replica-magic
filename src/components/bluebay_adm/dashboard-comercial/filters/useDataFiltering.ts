
import { useState, useEffect, useMemo } from "react";
import { FaturamentoItem, PedidoItem } from "@/services/bluebay/dashboardComercialTypes";
import { encontrarPedidoCorrespondente } from "../utils/pedidoUtils";

interface FilteredData {
  filteredFaturamentoItems: FaturamentoItem[];
  filteredPedidoItems: PedidoItem[];
  calculatedTotals: {
    totalFaturado: number;
    totalItens: number;
    mediaValorItem: number;
  };
  naoIdentificados: any[];
  hasFilteredData: boolean;
}

export const useDataFiltering = (
  dashboardData: { 
    faturamentoItems: FaturamentoItem[];
    pedidoItems: PedidoItem[];
  } | null,
  selectedCentroCusto: string | null,
  isLoading: boolean
): FilteredData => {
  // Estado para armazenar as correspondências não encontradas para debug
  const [naoIdentificados, setNaoIdentificados] = useState<any[]>([]);

  // Otimização: Usar useMemo para não recalcular a cada renderização
  const filteredFaturamentoItems = useMemo(() => {
    if (!dashboardData || isLoading) return [];
    
    if (!selectedCentroCusto) return dashboardData.faturamentoItems;
    
    return dashboardData.faturamentoItems.filter(item => {
      // Se o Centro de Custo for "Não identificado"
      if (selectedCentroCusto === "Não identificado") {
        const pedidoCorrespondente = encontrarPedidoCorrespondente(item, dashboardData.pedidoItems);
        return !pedidoCorrespondente;
      } else {
        const pedidoCorrespondente = encontrarPedidoCorrespondente(item, dashboardData.pedidoItems);
        return pedidoCorrespondente?.CENTROCUSTO === selectedCentroCusto;
      }
    });
  }, [dashboardData, selectedCentroCusto, isLoading]);

  const filteredPedidoItems = useMemo(() => {
    if (!dashboardData || isLoading) return [];
    
    if (!selectedCentroCusto) return dashboardData.pedidoItems;
    
    if (selectedCentroCusto === "Não identificado") return [];
    
    return dashboardData.pedidoItems.filter(item => 
      item.CENTROCUSTO === selectedCentroCusto
    );
  }, [dashboardData, selectedCentroCusto, isLoading]);

  // Calcular totais a partir dos itens filtrados
  const calculatedTotals = useMemo(() => {
    const totalFaturado = filteredFaturamentoItems.reduce(
      (sum, item) => sum + (item.VALOR_NOTA || 0), 0
    );
    
    const totalItens = filteredFaturamentoItems.reduce(
      (sum, item) => sum + (item.QUANTIDADE || 0), 0
    );
    
    const mediaValorItem = totalItens > 0 ? totalFaturado / totalItens : 0;
    
    return { totalFaturado, totalItens, mediaValorItem };
  }, [filteredFaturamentoItems]);

  // Diagnosticar problemas somente quando necessário e com limites para não sobrecarregar
  useEffect(() => {
    if (!dashboardData || isLoading) return;

    // Usar um timeout para não bloquear a renderização
    const diagnosisTimer = setTimeout(() => {
      // Apenas diagnosticar se houver uma quantidade significativa de itens
      if (dashboardData.faturamentoItems.length > 1000) {
        // Selecionar uma amostra para diagnóstico (até 5%)
        const sampleSize = Math.min(500, Math.ceil(dashboardData.faturamentoItems.length * 0.05));
        const sampleItems = dashboardData.faturamentoItems.slice(0, sampleSize);
        
        const diagnosticoItems = sampleItems
          .filter(item => item.PED_NUMPEDIDO && item.PED_ANOBASE)
          .filter(item => {
            const pedido = encontrarPedidoCorrespondente(item, dashboardData.pedidoItems);
            return !pedido;
          })
          .map(item => ({
            faturamento: {
              NOTA: item.NOTA,
              PED_NUMPEDIDO: item.PED_NUMPEDIDO,
              PED_ANOBASE: item.PED_ANOBASE,
              MPED_NUMORDEM: item.MPED_NUMORDEM,
              DATA_EMISSAO: item.DATA_EMISSAO
            }
          }))
          .slice(0, 10); // Limitar a 10 itens máximo no relatório
        
        if (diagnosticoItems.length > 0) {
          console.log(`Diagnóstico: ${diagnosticoItems.length} itens de faturamento sem correspondência na amostra`);
          setNaoIdentificados(diagnosticoItems);
        } else {
          setNaoIdentificados([]);
        }
      }
    }, 1000);
    
    return () => clearTimeout(diagnosisTimer);
  }, [dashboardData, isLoading]);

  const hasFilteredData = filteredFaturamentoItems.length > 0;

  return {
    filteredFaturamentoItems,
    filteredPedidoItems,
    calculatedTotals,
    naoIdentificados,
    hasFilteredData
  };
};
