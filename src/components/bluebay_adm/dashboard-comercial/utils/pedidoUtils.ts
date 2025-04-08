
import { FaturamentoItem, PedidoItem } from '@/services/bluebay/dashboardComercialTypes';

/**
 * Normaliza valores antes da comparação, tratando nulos e indefinidos
 */
export const normalizeValue = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

/**
 * Encontra um pedido correspondente a um item de faturamento
 * usando uma estratégia em três etapas para melhorar a correspondência
 * e garantir que não haja associações duplicadas
 */
export const encontrarPedidoCorrespondente = (item: any, pedidos: any[]) => {
  if (!item.PED_NUMPEDIDO && !item.PED_ANOBASE) return null;

  const itemNumPedido = normalizeValue(item.PED_NUMPEDIDO);
  const itemAnoBase = normalizeValue(item.PED_ANOBASE);
  
  // Primeira etapa: confirmar que temos uma chave válida
  if (!itemNumPedido || !itemAnoBase) {
    console.log(`Chave de pedido inválida para nota ${item.NOTA}: PED_NUMPEDIDO=${itemNumPedido}, PED_ANOBASE=${itemAnoBase}`);
    return null;
  }

  // Segunda etapa: Busca com chave composta completa (PED_NUMPEDIDO + PED_ANOBASE + MPED_NUMORDEM)
  if (item.MPED_NUMORDEM !== null && item.MPED_NUMORDEM !== undefined) {
    const itemNumOrdem = normalizeValue(item.MPED_NUMORDEM);
    
    const pedidoCompleto = pedidos.find(p => 
      normalizeValue(p.PED_NUMPEDIDO) === itemNumPedido &&
      normalizeValue(p.PED_ANOBASE) === itemAnoBase &&
      normalizeValue(p.MPED_NUMORDEM) === itemNumOrdem
    );
    
    if (pedidoCompleto) {
      // Diagnóstico para nota específica 252566
      if (item.NOTA === '252566') {
        console.log('Associação encontrada para nota 252566 (chave completa):', {
          faturamento: {
            NOTA: item.NOTA,
            PED_NUMPEDIDO: itemNumPedido,
            PED_ANOBASE: itemAnoBase,
            MPED_NUMORDEM: itemNumOrdem
          },
          pedido: {
            PED_NUMPEDIDO: normalizeValue(pedidoCompleto.PED_NUMPEDIDO),
            PED_ANOBASE: normalizeValue(pedidoCompleto.PED_ANOBASE),
            MPED_NUMORDEM: normalizeValue(pedidoCompleto.MPED_NUMORDEM),
            CENTROCUSTO: pedidoCompleto.CENTROCUSTO
          }
        });
      }
      return pedidoCompleto;
    }
  }

  // Terceira etapa: Busca com chave composta principal (PED_NUMPEDIDO + PED_ANOBASE)
  const pedidosSemNumOrdem = pedidos.filter(p => 
    normalizeValue(p.PED_NUMPEDIDO) === itemNumPedido &&
    normalizeValue(p.PED_ANOBASE) === itemAnoBase
  );
  
  // Verificar se há múltiplos pedidos correspondentes (possível ambiguidade)
  if (pedidosSemNumOrdem.length > 1) {
    console.warn(`Múltiplos pedidos encontrados para a nota ${item.NOTA}: `, {
      PED_NUMPEDIDO: itemNumPedido,
      PED_ANOBASE: itemAnoBase,
      quantidade: pedidosSemNumOrdem.length,
      pedidos: pedidosSemNumOrdem.map(p => ({
        CENTROCUSTO: p.CENTROCUSTO,
        PED_NUMPEDIDO: p.PED_NUMPEDIDO,
        PED_ANOBASE: p.PED_ANOBASE,
        MPED_NUMORDEM: p.MPED_NUMORDEM
      }))
    });
    
    // Em caso de ambiguidade, tentamos priorizar pelo centro de custo mais relevante
    // Ou pelo primeiro pedido encontrado se todos tiverem o mesmo centro de custo
    const centrosCusto = pedidosSemNumOrdem.map(p => p.CENTROCUSTO);
    const centrosUnicos = [...new Set(centrosCusto)];
    
    if (centrosUnicos.length === 1) {
      // Se todos têm o mesmo centro de custo, usamos o primeiro
      return pedidosSemNumOrdem[0];
    } else {
      // Prioridade para centros de custo mais relevantes
      const prioridadeCentros = ['BLUEBAY', 'BKINICIAL', 'JAB'];
      
      for (const centro of prioridadeCentros) {
        const pedidoEncontrado = pedidosSemNumOrdem.find(p => p.CENTROCUSTO === centro);
        if (pedidoEncontrado) return pedidoEncontrado;
      }
      
      // Se nenhum dos centros prioritários foi encontrado, usa o primeiro
      return pedidosSemNumOrdem[0];
    }
  }
  
  // Se houver apenas um resultado, retorná-lo
  if (pedidosSemNumOrdem.length === 1) {
    // Diagnóstico para nota específica 252566
    if (item.NOTA === '252566') {
      console.log('Associação encontrada para nota 252566 (chave parcial):', {
        faturamento: {
          NOTA: item.NOTA,
          PED_NUMPEDIDO: itemNumPedido,
          PED_ANOBASE: itemAnoBase,
        },
        pedido: {
          PED_NUMPEDIDO: normalizeValue(pedidosSemNumOrdem[0].PED_NUMPEDIDO),
          PED_ANOBASE: normalizeValue(pedidosSemNumOrdem[0].PED_ANOBASE),
          CENTROCUSTO: pedidosSemNumOrdem[0].CENTROCUSTO
        }
      });
    }
    return pedidosSemNumOrdem[0];
  }

  return null;
};

/**
 * Processa dados de faturamento e pedidos para gerar indicadores por centro de custo
 */
export interface CentroCustoData {
  nome: string;
  totalFaturado: number;
  totalItensFaturados: number;
  ticketMedioFaturado: number;
  totalPedidos: number;
  totalItensPedidos: number;
}

export const processarIndicadoresCentroCusto = (
  faturamentoItems: FaturamentoItem[], 
  pedidoItems: PedidoItem[]
): CentroCustoData[] => {
  const centroCustoMap = new Map<string, CentroCustoData>();
  
  // Criar mapa de faturamento por número de pedido
  const faturamentoPorPedido = new Map<string, FaturamentoItem[]>();
  faturamentoItems.forEach(item => {
    if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
    
    const pedidoKey = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}`;
    if (!faturamentoPorPedido.has(pedidoKey)) {
      faturamentoPorPedido.set(pedidoKey, []);
    }
    faturamentoPorPedido.get(pedidoKey)?.push(item);
  });
  
  // Para diagnóstico: verificar múltiplos pedidos com a mesma chave
  const pedidosPorChave = new Map<string, PedidoItem[]>();
  pedidoItems.forEach(item => {
    if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
    const pedidoKey = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}`;
    if (!pedidosPorChave.has(pedidoKey)) {
      pedidosPorChave.set(pedidoKey, []);
    }
    pedidosPorChave.get(pedidoKey)?.push(item);
  });
  
  // Identificar chaves com múltiplos pedidos (possível ambiguidade)
  pedidosPorChave.forEach((pedidos, chave) => {
    if (pedidos.length > 1) {
      console.warn(`Múltiplos pedidos com a mesma chave: ${chave}`, {
        quantidade: pedidos.length,
        pedidos: pedidos.map(p => ({
          CENTROCUSTO: p.CENTROCUSTO,
          PED_NUMPEDIDO: p.PED_NUMPEDIDO,
          PED_ANOBASE: p.PED_ANOBASE,
          MPED_NUMORDEM: p.MPED_NUMORDEM
        }))
      });
    }
  });
  
  // Processar dados de pedidos
  pedidoItems.forEach(item => {
    const centroCusto = item.CENTROCUSTO || 'Não identificado';
    
    if (!centroCustoMap.has(centroCusto)) {
      centroCustoMap.set(centroCusto, {
        nome: centroCusto,
        totalFaturado: 0,
        totalItensFaturados: 0,
        ticketMedioFaturado: 0,
        totalPedidos: 0,
        totalItensPedidos: 0
      });
    }
    
    const data = centroCustoMap.get(centroCusto)!;
    
    // Acumular valores de pedidos
    const valorPedido = (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
    data.totalPedidos += valorPedido;
    data.totalItensPedidos += item.QTDE_PEDIDA || 0;
    
    // Verificar se há faturamento para este pedido usando a nova função de busca
    if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
    const pedidoKey = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}`;
    const faturamentoItems = faturamentoPorPedido.get(pedidoKey) || [];
    
    // Acumular valores de faturamento relacionados a este pedido
    faturamentoItems.forEach(fatItem => {
      // Verificar se este faturamento realmente corresponde a este pedido específico
      const realMatch = encontrarPedidoCorrespondente(fatItem, [item]);
      if (realMatch) {
        data.totalFaturado += fatItem.VALOR_NOTA || 0;
        data.totalItensFaturados += fatItem.QUANTIDADE || 0;
      }
    });
  });
  
  // Processar notas fiscais sem pedidos associados (não identificado)
  const pedidosProcessados = new Set<string>();
  
  // Marcar todos os pedidos já processados
  pedidoItems.forEach(item => {
    if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
    const pedidoKey = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}`;
    pedidosProcessados.add(pedidoKey);
  });
  
  // Verificar notas fiscais sem pedidos associados e atribuir ao "Não identificado"
  faturamentoItems.forEach(item => {
    // Verificar se este item de faturamento já foi processado através de um pedido
    const pedidoCorrespondente = encontrarPedidoCorrespondente(item, pedidoItems);
    
    if (!pedidoCorrespondente) {
      const centroCusto = 'Não identificado';
      
      if (!centroCustoMap.has(centroCusto)) {
        centroCustoMap.set(centroCusto, {
          nome: centroCusto,
          totalFaturado: 0,
          totalItensFaturados: 0,
          ticketMedioFaturado: 0,
          totalPedidos: 0,
          totalItensPedidos: 0
        });
      }
      
      const data = centroCustoMap.get(centroCusto)!;
      data.totalFaturado += item.VALOR_NOTA || 0;
      data.totalItensFaturados += item.QUANTIDADE || 0;
      
      // Log de diagnóstico para notas sem pedido correspondente
      if (item.PED_NUMPEDIDO && item.PED_ANOBASE) {
        console.log(`Nota sem pedido correspondente: ${item.NOTA}`, {
          PED_NUMPEDIDO: item.PED_NUMPEDIDO,
          PED_ANOBASE: item.PED_ANOBASE,
          MPED_NUMORDEM: item.MPED_NUMORDEM
        });
      }
    }
  });
  
  // Calcular ticket médio para cada centro de custo
  centroCustoMap.forEach(data => {
    data.ticketMedioFaturado = data.totalItensFaturados > 0 ? 
      data.totalFaturado / data.totalItensFaturados : 0;
  });
  
  // Converter Map para array e ordenar por nome
  return Array.from(centroCustoMap.values())
    .sort((a, b) => a.nome.localeCompare(b.nome));
};
