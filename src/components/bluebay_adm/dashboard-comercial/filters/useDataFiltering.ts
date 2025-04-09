
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
    
    // Procurar especificamente a nota 252770 para análise detalhada
    const nota252770 = dashboardData.faturamentoItems.find(item => item.NOTA === '252770');
    if (nota252770) {
      const pedidoCorrespondente = encontrarPedidoCorrespondente(nota252770, dashboardData.pedidoItems);
      console.log('Análise específica da nota 252770:', {
        notaData: {
          PED_NUMPEDIDO: nota252770.PED_NUMPEDIDO,
          PED_ANOBASE: nota252770.PED_ANOBASE,
          MPED_NUMORDEM: nota252770.MPED_NUMORDEM,
          VALOR_NOTA: nota252770.VALOR_NOTA,
          DATA_EMISSAO: nota252770.DATA_EMISSAO
        },
        pedidoEncontrado: pedidoCorrespondente ? {
          PED_NUMPEDIDO: pedidoCorrespondente.PED_NUMPEDIDO,
          PED_ANOBASE: pedidoCorrespondente.PED_ANOBASE,
          MPED_NUMORDEM: pedidoCorrespondente.MPED_NUMORDEM,
          CENTROCUSTO: pedidoCorrespondente.CENTROCUSTO
        } : 'Pedido não encontrado'
      });
    }
    
    // Procurar especificamente a nota 252566 que apresenta problemas
    const nota252566 = dashboardData.faturamentoItems.find(item => item.NOTA === '252566');
    if (nota252566) {
      const pedidoCorrespondente = encontrarPedidoCorrespondente(nota252566, dashboardData.pedidoItems);
      console.log('Análise específica da nota 252566:', {
        notaData: {
          PED_NUMPEDIDO: nota252566.PED_NUMPEDIDO,
          PED_ANOBASE: nota252566.PED_ANOBASE,
          MPED_NUMORDEM: nota252566.MPED_NUMORDEM,
          VALOR_NOTA: nota252566.VALOR_NOTA,
          DATA_EMISSAO: nota252566.DATA_EMISSAO
        },
        pedidoEncontrado: pedidoCorrespondente ? {
          PED_NUMPEDIDO: pedidoCorrespondente.PED_NUMPEDIDO,
          PED_ANOBASE: pedidoCorrespondente.PED_ANOBASE,
          MPED_NUMORDEM: pedidoCorrespondente.MPED_NUMORDEM,
          CENTROCUSTO: pedidoCorrespondente.CENTROCUSTO
        } : 'Pedido não encontrado'
      });
    }
    
    // Coleta diagnóstico para todos os itens sem correspondência
    dashboardData.faturamentoItems.forEach(item => {
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
      console.log(`Encontrados ${diagnosticos.length} itens de faturamento sem correspondência`, diagnosticos);
      // Mostrar os primeiros 10 itens para não sobrecarregar o console
      const primeiros10 = diagnosticos.slice(0, 10);
      console.log('Primeiros 10 itens não identificados:', primeiros10);
      
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
