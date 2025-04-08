
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DailyFaturamento, FaturamentoItem, MonthlyFaturamento, PedidoItem } from '../dashboardComercialTypes';

/**
 * Processa dados de faturamento para gerar resumos diários e mensais
 */
export const processarDadosFaturamento = (faturamentoData: FaturamentoItem[], pedidoData: PedidoItem[] = []) => {
  // Mapas para acumular valores por dia e mês
  const dailyMap = new Map<string, { faturado: number, pedido: number }>();
  const monthlyMap = new Map<string, { faturado: number, pedido: number }>();
  
  // Valores totais
  let totalFaturado = 0;
  let totalItens = 0;

  // Datas para verificar o intervalo real dos dados
  let minDate: Date | null = null;
  let maxDate: Date | null = null;

  // Processar os dados de faturamento
  faturamentoData.forEach(item => {
    if (!item.DATA_EMISSAO || !item.QUANTIDADE || !item.VALOR_UNITARIO) return;
    
    const itemDate = typeof item.DATA_EMISSAO === 'string' 
      ? parseISO(item.DATA_EMISSAO) 
      : new Date(item.DATA_EMISSAO);
    
    // Atualiza as datas min/max para informar ao usuário o intervalo real de dados
    if (!minDate || itemDate < minDate) {
      minDate = itemDate;
    }
    if (!maxDate || itemDate > maxDate) {
      maxDate = itemDate;
    }
    
    // Formato yyyy-MM-dd para agrupamento diário
    const dayKey = format(itemDate, 'yyyy-MM-dd');
    // Formato yyyy-MM para agrupamento mensal
    const monthKey = format(itemDate, 'yyyy-MM');
    
    // Calcular valor faturado para este item
    const quantidade = Number(item.QUANTIDADE);
    const valorUnitario = Number(item.VALOR_UNITARIO);
    const valorFaturadoItem = quantidade * valorUnitario;
    
    // Inicializar se não existe
    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, { faturado: 0, pedido: 0 });
    }
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { faturado: 0, pedido: 0 });
    }
    
    // Acumular para dados diários
    const dailyValues = dailyMap.get(dayKey)!;
    dailyMap.set(dayKey, { 
      faturado: dailyValues.faturado + valorFaturadoItem,
      pedido: dailyValues.pedido
    });
    
    // Acumular para dados mensais
    const monthlyValues = monthlyMap.get(monthKey)!;
    monthlyMap.set(monthKey, {
      faturado: monthlyValues.faturado + valorFaturadoItem,
      pedido: monthlyValues.pedido
    });
    
    // Acumular totais
    totalFaturado += valorFaturadoItem;
    totalItens += quantidade;
  });
  
  // Processar os dados de pedido usando DATA_PEDIDO
  pedidoData.forEach(item => {
    if (!item.DATA_PEDIDO || !item.QTDE_PEDIDA || !item.VALOR_UNITARIO) return;
    
    // Usando DATA_PEDIDO para o gráfico de pedidos
    const itemDate = typeof item.DATA_PEDIDO === 'string' 
      ? parseISO(item.DATA_PEDIDO) 
      : new Date(item.DATA_PEDIDO);
    
    // Formato yyyy-MM-dd para agrupamento diário
    const dayKey = format(itemDate, 'yyyy-MM-dd');
    // Formato yyyy-MM para agrupamento mensal
    const monthKey = format(itemDate, 'yyyy-MM');
    
    // Calcular valor pedido para este item
    const quantidade = Number(item.QTDE_PEDIDA);
    const valorUnitario = Number(item.VALOR_UNITARIO);
    const valorPedidoItem = quantidade * valorUnitario;
    
    // Inicializar se não existe
    if (!dailyMap.has(dayKey)) {
      dailyMap.set(dayKey, { faturado: 0, pedido: 0 });
    }
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { faturado: 0, pedido: 0 });
    }
    
    // Acumular para dados diários
    const dailyValues = dailyMap.get(dayKey)!;
    dailyMap.set(dayKey, { 
      faturado: dailyValues.faturado,
      pedido: dailyValues.pedido + valorPedidoItem
    });
    
    // Acumular para dados mensais
    const monthlyValues = monthlyMap.get(monthKey)!;
    monthlyMap.set(monthKey, {
      faturado: monthlyValues.faturado,
      pedido: monthlyValues.pedido + valorPedidoItem
    });
  });

  // Converter mapas para arrays e formatar para visualização
  const dailyFaturamento: DailyFaturamento[] = Array.from(dailyMap).map(([date, values]) => {
    const parsedDate = parseISO(date);
    return {
      date,
      total: values.faturado,
      pedidoTotal: values.pedido,
      formattedDate: format(parsedDate, 'dd/MM/yyyy')
    };
  }).sort((a, b) => a.date.localeCompare(b.date));

  const monthlyFaturamento: MonthlyFaturamento[] = Array.from(monthlyMap).map(([month, values]) => {
    // Formato yyyy-MM para o primeiro dia do mês
    const parsedDate = parseISO(`${month}-01`);
    return {
      month,
      total: values.faturado,
      pedidoTotal: values.pedido,
      formattedMonth: format(parsedDate, 'MMMM yyyy', { locale: ptBR })
    };
  }).sort((a, b) => a.month.localeCompare(b.month));

  // Calcular média por item
  const mediaValorItem = totalItens > 0 ? totalFaturado / totalItens : 0;

  return {
    dailyFaturamento,
    monthlyFaturamento,
    totalFaturado,
    totalItens,
    mediaValorItem,
    minDate,
    maxDate
  };
};
