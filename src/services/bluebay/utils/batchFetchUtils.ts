
import { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Utility to fetch data in batches to avoid the 1000 record limit
 * @param fetchFunction Function that performs the actual fetch with pagination
 * @param batchSize Size of each batch
 * @returns Combined results from all batches
 */
export async function fetchInBatches<T>(
  fetchFunction: (offset: number, limit: number) => Promise<PostgrestResponse<T>>,
  batchSize: number = 5000
): Promise<T[]> {
  let allResults: T[] = [];
  let hasMore = true;
  let offset = 0;
  let batchCount = 0;
  let lastBatchSize = 0;

  while (hasMore) {
    console.log(`Buscando lote ${batchCount + 1} (offset: ${offset}, limit: ${batchSize})...`);
    
    const { data, error, count } = await fetchFunction(offset, batchSize);
    
    if (error) {
      console.error(`Erro ao buscar lote ${batchCount + 1}:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log(`Lote ${batchCount + 1} não retornou dados. Finalizando.`);
      hasMore = false;
      break;
    }
    
    lastBatchSize = data.length;
    allResults = [...allResults, ...data];
    offset += lastBatchSize;
    batchCount++;
    
    console.log(`Lote ${batchCount}: Recebidos ${lastBatchSize} registros. Total acumulado: ${allResults.length}`);
    
    // Se recebemos menos registros que o tamanho do batch, provavelmente chegamos ao fim
    if (lastBatchSize < batchSize) {
      console.log(`Lote ${batchCount} retornou menos que ${batchSize} registros (${lastBatchSize}). Finalizando.`);
      hasMore = false;
    }
  }
  
  console.log(`Processo de lotes concluído: ${allResults.length} registros carregados em ${batchCount} lotes.`);
  
  return allResults;
}
