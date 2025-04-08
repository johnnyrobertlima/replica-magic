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
 */
export const encontrarPedidoCorrespondente = (item: any, pedidos: any[]) => {
  if (!item.PED_NUMPEDIDO && !item.PED_ANOBASE) return null;

  const itemNumPedido = normalizeValue(item.PED_NUMPEDIDO);
  const itemAnoBase = normalizeValue(item.PED_ANOBASE);
  
  // Primeiro, tentamos com o MPED_NUMORDEM (correspondência completa)
  if (item.MPED_NUMORDEM !== null && item.MPED_NUMORDEM !== undefined) {
    const itemNumOrdem = normalizeValue(item.MPED_NUMORDEM);
    
    const pedido = pedidos.find(p => 
      normalizeValue(p.PED_NUMPEDIDO) === itemNumPedido &&
      normalizeValue(p.PED_ANOBASE) === itemNumPedido &&
      normalizeValue(p.MPED_NUMORDEM) === itemNumOrdem
    );
    
    if (pedido) return pedido;
  }

  // Corrigido: Segunda tentativa - comparar PED_NUMPEDIDO, PED_ANOBASE e MPED_NUMORDEM
  // com validação mais precisa dos tipos de dados
  const pedidoComNumOrdem = pedidos.find(p => {
    const pNumPedido = normalizeValue(p.PED_NUMPEDIDO);
    const pAnoBase = normalizeValue(p.PED_ANOBASE);
    const pNumOrdem = normalizeValue(p.MPED_NUMORDEM);
    const itemNumOrdem = normalizeValue(item.MPED_NUMORDEM);
    
    return pNumPedido === itemNumPedido && 
           pAnoBase === itemAnoBase && 
           pNumOrdem === itemNumOrdem;
  });
  
  if (pedidoComNumOrdem) return pedidoComNumOrdem;

  // Terceira tentativa - comparação flexível apenas com PED_NUMPEDIDO e PED_ANOBASE
  const pedidoSemNumOrdem = pedidos.find(p => 
    normalizeValue(p.PED_NUMPEDIDO) === itemNumPedido &&
    normalizeValue(p.PED_ANOBASE) === itemAnoBase
  );

  return pedidoSemNumOrdem;
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
    
    const pedidoKey = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-${normalizeValue(item.MPED_NUMORDEM || '')}`;
    if (!faturamentoPorPedido.has(pedidoKey)) {
      faturamentoPorPedido.set(pedidoKey, []);
    }
    faturamentoPorPedido.get(pedidoKey)?.push(item);
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
    const pedidoKey1 = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-${normalizeValue(item.MPED_NUMORDEM)}`;
    const pedidoKey2 = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-`;
    
    // Procura com a chave completa ou com a chave parcial (sem MPED_NUMORDEM)
    const faturamentoItems1 = faturamentoPorPedido.get(pedidoKey1) || [];
    const faturamentoItems2 = faturamentoPorPedido.get(pedidoKey2) || [];
    const todosItens = [...faturamentoItems1, ...faturamentoItems2];
    
    // Acumular valores de faturamento relacionados a este pedido
    todosItens.forEach(fatItem => {
      data.totalFaturado += fatItem.VALOR_NOTA || 0;
      data.totalItensFaturados += fatItem.QUANTIDADE || 0;
    });
  });
  
  // Processar notas fiscais sem pedidos associados (não identificado)
  const pedidosProcessados = new Set<string>();
  
  // Marcar todos os pedidos já processados
  pedidoItems.forEach(item => {
    if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) return;
    
    // Gerar ambas as chaves possíveis (com e sem MPED_NUMORDEM)
    const pedidoKey1 = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-${normalizeValue(item.MPED_NUMORDEM)}`;
    const pedidoKey2 = `${normalizeValue(item.PED_NUMPEDIDO)}-${normalizeValue(item.PED_ANOBASE)}-`;
    
    pedidosProcessados.add(pedidoKey1);
    pedidosProcessados.add(pedidoKey2);
  });
  
  // Verificar notas fiscais sem pedidos associados e atribuir ao "Não identificado"
  faturamentoItems.forEach(item => {
    // Casos em que a nota não tem referência a pedido
    if (!item.PED_NUMPEDIDO || !item.PED_ANOBASE) {
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
      return;
    }
    
    // Verificar se este item de faturamento já foi processado através de um pedido
    const pedidoCorrespondente = encontrarPedidoCorrespondente(item, pedidoItems);
    
    if (!pedidoCorrespondente) {
      // Este item de faturamento não tem pedido correspondente
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
