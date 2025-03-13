
import { supabase } from "@/integrations/supabase/client";

/**
 * Formats date to ISO string date format (YYYY-MM-DD)
 */
export function formatDateForQuery(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Creates a date range string with the end of day time for the final date
 */
export function createDateRangeForQuery(dataInicial: string, dataFinal: string): {
  startDate: string;
  endDate: string;
} {
  return {
    startDate: dataInicial,
    endDate: `${dataFinal} 23:59:59.999`
  };
}

/**
 * Batch an array into chunks of specified size
 */
export function batchArray<T>(array: T[], batchSize: number): T[][] {
  const batches = [];
  
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  
  return batches;
}

/**
 * Create maps for quick data lookup
 */
export function createDataMaps(
  pessoas: any[],
  itens: any[],
  estoque: any[]
) {
  return {
    pessoasMap: new Map(pessoas.map(p => [p.PES_CODIGO, p])),
    itemMap: new Map(itens.map(i => [i.ITEM_CODIGO, i.DESCRICAO])),
    estoqueMap: new Map(estoque.map(e => [e.ITEM_CODIGO, e.FISICO]))
  };
}
