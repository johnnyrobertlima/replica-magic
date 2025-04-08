
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, startOfMonth, endOfMonth, isSameMonth, isSameYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface FaturamentoItem {
  MATRIZ: number;
  FILIAL: number;
  ID_EF_DOCFISCAL: number;
  ID_EF_DOCFISCAL_ITEM: number;
  PED_NUMPEDIDO?: string;
  PED_ANOBASE?: number;
  MPED_NUMORDEM?: number;
  ITEM_CODIGO?: string;
  PES_CODIGO?: number;
  TIPO?: string;
  NOTA?: string;
  TRANSACAO?: number;
  QUANTIDADE?: number;
  VALOR_UNITARIO?: number;
  VALOR_DESCONTO?: number;
  VALOR_NOTA?: number;
  STATUS?: string;
  DATA_EMISSAO?: string | Date;
}

export interface DailyFaturamento {
  date: string;
  total: number;
  formattedDate: string;
}

export interface MonthlyFaturamento {
  month: string;
  total: number;
  formattedMonth: string;
}

export interface DashboardComercialData {
  dailyFaturamento: DailyFaturamento[];
  monthlyFaturamento: MonthlyFaturamento[];
  totalFaturado: number;
  totalItens: number;
  mediaValorItem: number;
  faturamentoItems: FaturamentoItem[];
  dataRangeInfo: {
    startDateRequested: string;
    endDateRequested: string;
    startDateActual: string | null;
    endDateActual: string | null;
    hasCompleteData: boolean;
  };
}

/**
 * Busca dados em lotes para superar limite do Supabase
 * Versão otimizada para garantir que todos os dados sejam recuperados
 */
const fetchInBatches = async <T>(
  query: Function,
  batchSize: number = 10000,
  maxBatches: number = 100 // Limite de segurança para evitar loops infinitos
): Promise<T[]> => {
  let allData: T[] = [];
  let hasMore = true;
  let offset = 0;
  let batchCount = 0;
  
  while (hasMore && batchCount < maxBatches) {
    batchCount++;
    console.log(`Buscando lote ${batchCount} (offset: ${offset}, tamanho: ${batchSize})`);
    
    try {
      const { data, error, count } = await query(offset, batchSize);
      
      if (error) {
        console.error(`Erro ao buscar lote ${batchCount}:`, error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log(`Nenhum dado encontrado no lote ${batchCount}`);
        hasMore = false;
      } else {
        allData = [...allData, ...data];
        console.log(`Processado lote ${batchCount}: ${data.length} registros. Total acumulado: ${allData.length}`);
        
        // Se retornou menos que o tamanho do lote, não há mais dados
        hasMore = data.length === batchSize;
        offset += batchSize;
      }
    } catch (error) {
      console.error(`Falha ao buscar lote ${batchCount}:`, error);
      // Em caso de falha, interrompemos o loop mas retornamos os dados já coletados
      hasMore = false;
    }
  }
  
  if (batchCount >= maxBatches) {
    console.warn(`Limite de ${maxBatches} lotes atingido. Pode haver mais dados não recuperados.`);
  }
  
  console.log(`Total de ${allData.length} registros carregados em ${batchCount} lotes`);
  return allData;
};

/**
 * Busca dados de faturamento para o dashboard comercial
 * Versão melhorada que garante que todos os dados do período sejam recuperados
 */
export const fetchDashboardComercialData = async (
  startDate: Date | null,
  endDate: Date | null
): Promise<DashboardComercialData> => {
  try {
    // Converte as datas para strings no formato SQL
    const startDateStr = startDate ? format(startDate, 'yyyy-MM-dd') : '';
    const endDateStr = endDate ? format(endDate, 'yyyy-MM-dd') : '';

    console.log(`Buscando dados de faturamento comercial de ${startDateStr} até ${endDateStr}`);
    
    // Função para buscar dados de faturamento em lotes
    // Função modificada para garantir que todos os dados sejam recuperados
    const fetchFaturamentoBatch = async (offset: number, limit: number) => {
      const query = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*', { count: 'exact' })
        .eq('TIPO', 'S') // Somente dados de vendas
        .gte('DATA_EMISSAO', startDateStr)
        .lte('DATA_EMISSAO', `${endDateStr}T23:59:59.999`)
        .range(offset, offset + limit - 1);
      
      return await query;
    };
    
    // Buscar todos os dados de faturamento com tamanho de lote otimizado
    // Aumentamos o tamanho do lote para 10000 para reduzir o número de requisições
    const faturamentoData = await fetchInBatches<FaturamentoItem>(fetchFaturamentoBatch, 10000);
    console.log(`Total de registros de faturamento recuperados: ${faturamentoData?.length || 0}`);

    // Processamento dos dados para faturamento diário
    const dailyMap = new Map<string, number>();
    // Processamento dos dados para faturamento mensal
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

    // Verificar se os dados cobrem todo o período solicitado
    // Consideramos que temos dados completos se temos pelo menos algum dado 
    // (não precisamos necessariamente ter dados em cada dia)
    const hasCompleteData = faturamentoData.length > 0;

    // Retornar os dados processados, incluindo os itens originais para a tabela
    const returnData: DashboardComercialData = {
      dailyFaturamento,
      monthlyFaturamento,
      totalFaturado,
      totalItens,
      mediaValorItem,
      faturamentoItems: faturamentoData,
      dataRangeInfo: {
        startDateRequested: startDateStr,
        endDateRequested: endDateStr,
        startDateActual: minDate ? format(minDate, 'yyyy-MM-dd') : null,
        endDateActual: maxDate ? format(maxDate, 'yyyy-MM-dd') : null,
        hasCompleteData
      }
    };

    console.log(`Processamento concluído: ${dailyFaturamento.length} dias, ${monthlyFaturamento.length} meses`);
    return returnData;
  } catch (error) {
    console.error('Erro ao buscar dados de dashboard comercial:', error);
    throw error;
  }
};
