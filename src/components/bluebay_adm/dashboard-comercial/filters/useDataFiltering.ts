
import { useState, useEffect } from "react";
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

  // Efeito para coletar diagnósticos quando os dados mudam
  useEffect(() => {
    if (!dashboardData) return;
    
    // Coletar itens não identificados para diagnóstico
    const diagnosticos: any[] = [];
    dashboardData.faturamentoItems.forEach(item => {
      if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
      
      const pedido = encontrarPedidoCorrespondente(item, dashboardData.pedidoItems);
      if (!pedido) {
        diagnosticos.push({
          faturamento: {
            PED_NUMPEDIDO: item.PED_NUMPEDIDO,
            PED_ANOBASE: item.PED_ANOBASE,
            MPED_NUMORDEM: item.MPED_NUMORDEM,
            VALOR_NOTA: item.VALOR_NOTA,
            DATA_EMISSAO: item.DATA_EMISSAO
          }
        });
      }
    });
    
    if (diagnosticos.length > 0) {
      console.log(`Encontrados ${diagnosticos.length} itens de faturamento sem correspondência`, diagnosticos);
      setNaoIdentificados(diagnosticos);
    }
  }, [dashboardData]);

  // Filtrar dados com base no Centro de Custo selecionado usando a lógica aprimorada
  const filteredFaturamentoItems = selectedCentroCusto 
    ? dashboardData?.faturamentoItems.filter(item => {
        // Se o Centro de Custo for "Não identificado"
        if (selectedCentroCusto === "Não identificado") {
          // Verificar se há um pedido correspondente
          const pedidoCorrespondente = encontrarPedidoCorrespondente(item, dashboardData.pedidoItems);
          
          // Retornar true se não houver pedido correspondente (é "Não identificado")
          return !pedidoCorrespondente;
        } else {
          // Para outros centros de custo, buscar o pedido correspondente
          const pedidoCorrespondente = encontrarPedidoCorrespondente(item, dashboardData.pedidoItems);
          
          // Verificar se o pedido tem o centro de custo selecionado
          return pedidoCorrespondente?.CENTROCUSTO === selectedCentroCusto;
        }
      }) 
    : dashboardData?.faturamentoItems || [];
  
  const filteredPedidoItems = selectedCentroCusto 
    ? (selectedCentroCusto === "Não identificado" 
        ? [] // Para "Não identificado", não há pedidos, apenas itens de faturamento sem pedido correspondente
        : dashboardData?.pedidoItems.filter(item => item.CENTROCUSTO === selectedCentroCusto))
    : dashboardData?.pedidoItems || [];

  // Recalcular totais com base nos itens filtrados
  const calculatedTotals = {
    totalFaturado: filteredFaturamentoItems.reduce((sum, item) => sum + (item.VALOR_NOTA || 0), 0),
    totalItens: filteredFaturamentoItems.reduce((sum, item) => sum + (item.QUANTIDADE || 0), 0),
    mediaValorItem: 0
  };
  
  calculatedTotals.mediaValorItem = calculatedTotals.totalItens > 0 
    ? calculatedTotals.totalFaturado / calculatedTotals.totalItens 
    : 0;

  const hasFilteredData = filteredFaturamentoItems.length > 0;

  return {
    filteredFaturamentoItems,
    filteredPedidoItems,
    calculatedTotals,
    naoIdentificados,
    hasFilteredData
  };
};
