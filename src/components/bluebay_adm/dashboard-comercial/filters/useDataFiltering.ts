
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
    if (!dashboardData || isLoading) return;
    
    // Limitar o diagnóstico apenas quando realmente necessário
    // Usar setTimeout para não bloquear a interface
    const timer = setTimeout(() => {
      // Coletar itens não identificados para diagnóstico
      const diagnosticos: any[] = [];
      const totalItens = dashboardData.faturamentoItems.length;
      
      // Considerar apenas alguns itens para diagnóstico para evitar sobrecarga
      const itemsToProcess = Math.min(totalItens, 1000); // Limitar a 1000 itens para diagnóstico
      
      // Analisar apenas uma amostra dos dados para diagnóstico
      const sampleItems = dashboardData.faturamentoItems.slice(0, itemsToProcess);
      
      sampleItems.forEach(item => {
        if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
        
        const pedido = encontrarPedidoCorrespondente(item, dashboardData.pedidoItems);
        if (!pedido) {
          diagnosticos.push({
            faturamento: {
              NOTA: item.NOTA,
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
        console.log(`Encontrados ${diagnosticos.length} itens de faturamento sem correspondência em amostra de ${itemsToProcess} itens`);
        // Mostrar no máximo 10 itens para não sobrecarregar o console
        const primeiros10 = diagnosticos.slice(0, 10);
        console.log('Amostra de itens não identificados:', primeiros10);
        
        setNaoIdentificados(diagnosticos);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [dashboardData, isLoading]);

  // Filtrar dados com base no Centro de Custo selecionado usando a lógica aprimorada
  const filteredFaturamentoItems = !dashboardData ? [] : selectedCentroCusto 
    ? dashboardData.faturamentoItems.filter(item => {
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
    : dashboardData.faturamentoItems;
  
  const filteredPedidoItems = !dashboardData ? [] : selectedCentroCusto 
    ? (selectedCentroCusto === "Não identificado" 
        ? [] // Para "Não identificado", não há pedidos, apenas itens de faturamento sem pedido correspondente
        : dashboardData.pedidoItems.filter(item => item.CENTROCUSTO === selectedCentroCusto))
    : dashboardData.pedidoItems;

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
