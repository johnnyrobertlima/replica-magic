
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
  ambiguityDetected: boolean;
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
  const [ambiguityDetected, setAmbiguityDetected] = useState<boolean>(false);

  // Efeito para coletar diagnósticos quando os dados mudam
  useEffect(() => {
    if (!dashboardData) return;
    
    // Coletar itens não identificados para diagnóstico
    const diagnosticos: any[] = [];
    const ambiguidadeDetectada = { detected: false };
    
    // Procurar especificamente a nota 252566 para análise detalhada
    const nota252566 = dashboardData.faturamentoItems.find(item => item.NOTA === '252566');
    if (nota252566) {
      console.log('Analisando nota 252566:', {
        PED_NUMPEDIDO: nota252566.PED_NUMPEDIDO,
        PED_ANOBASE: nota252566.PED_ANOBASE,
        MPED_NUMORDEM: nota252566.MPED_NUMORDEM,
      });
      
      // Buscar todos os pedidos que possam corresponder à nota 252566
      const pedidosPotenciais = dashboardData.pedidoItems.filter(p => 
        String(p.PED_NUMPEDIDO).trim() === String(nota252566.PED_NUMPEDIDO).trim() && 
        String(p.PED_ANOBASE).trim() === String(nota252566.PED_ANOBASE).trim()
      );
      
      console.log(`Encontrados ${pedidosPotenciais.length} pedidos potenciais para a nota 252566:`, 
        pedidosPotenciais.map(p => ({
          PED_NUMPEDIDO: p.PED_NUMPEDIDO,
          PED_ANOBASE: p.PED_ANOBASE,
          MPED_NUMORDEM: p.MPED_NUMORDEM,
          CENTROCUSTO: p.CENTROCUSTO
        }))
      );
      
      // Usar a função melhorada para encontrar o pedido correto
      const pedidoCorrespondente = encontrarPedidoCorrespondente(nota252566, dashboardData.pedidoItems);
      
      console.log('Resultado da busca para nota 252566:', {
        pedidoEncontrado: pedidoCorrespondente ? {
          PED_NUMPEDIDO: pedidoCorrespondente.PED_NUMPEDIDO,
          PED_ANOBASE: pedidoCorrespondente.PED_ANOBASE,
          MPED_NUMORDEM: pedidoCorrespondente.MPED_NUMORDEM,
          CENTROCUSTO: pedidoCorrespondente.CENTROCUSTO
        } : 'Pedido não encontrado'
      });
      
      // Detectar ambiguidade para a nota 252566
      if (pedidosPotenciais.length > 1) {
        ambiguidadeDetectada.detected = true;
        console.warn('AMBIGUIDADE DETECTADA para nota 252566!');
      }
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
    
    // Atualizar estado de ambiguidade
    setAmbiguityDetected(ambiguidadeDetectada.detected);
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
    hasFilteredData,
    ambiguityDetected
  };
};
