
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
