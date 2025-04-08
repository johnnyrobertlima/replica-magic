
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DailyFaturamento, FaturamentoItem, MonthlyFaturamento } from '../dashboardComercialTypes';

/**
 * Processa dados de faturamento para gerar resumos diários e mensais
 */
export const processarDadosFaturamento = (faturamentoData: FaturamentoItem[]) => {
  // Mapas para acumular valores por dia e mês
  const dailyMap = new Map<string, number>();
  const monthlyMap = new Map<string, number>();
  
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
    
    // Acumular para dados diários
    dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + valorFaturadoItem);
    
    // Acumular para dados mensais
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + valorFaturadoItem);
    
    // Acumular totais
    totalFaturado += valorFaturadoItem;
    totalItens += quantidade;
  });

  // Converter mapas para arrays e formatar para visualização
  const dailyFaturamento: DailyFaturamento[] = Array.from(dailyMap).map(([date, total]) => {
    const parsedDate = parseISO(date);
    return {
      date,
      total,
      formattedDate: format(parsedDate, 'dd/MM/yyyy')
    };
  }).sort((a, b) => a.date.localeCompare(b.date));

  const monthlyFaturamento: MonthlyFaturamento[] = Array.from(monthlyMap).map(([month, total]) => {
    // Formato yyyy-MM para o primeiro dia do mês
    const parsedDate = parseISO(`${month}-01`);
    return {
      month,
      total,
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
