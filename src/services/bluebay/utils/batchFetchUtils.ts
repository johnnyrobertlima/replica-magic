
import { PostgrestResponse } from '@supabase/supabase-js';

/**
 * Utility to fetch data in batches to avoid the 1000 record limit
 * @param fetchFunction Function that performs the actual fetch with pagination
 * @param batchSize Size of each batch
 * @returns Combined results from all batches
 */
export async function fetchInBatches<T>(
  fetchFunction: (offset: number, limit: number) => Promise<PostgrestResponse<T>>,
  batchSize: number = 1000
): Promise<T[]> {
  let allResults: T[] = [];
  let hasMore = true;
  let offset = 0;
  let batchCount = 0;

  while (hasMore) {
    const { data, error } = await fetchFunction(offset, batchSize);
    
    if (error) {
      console.error('Erro ao buscar lote de dados:', error);
      break;
    }
    
    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }
    
    allResults = [...allResults, ...data];
    offset += data.length;
    batchCount++;
    
    // Log progress every 5 batches
    if (batchCount % 5 === 0) {
      console.log(`Progresso: ${allResults.length} registros carregados em ${batchCount} lotes`);
    }
    
    // Check if we got fewer records than requested, meaning we're at the end
    if (data.length < batchSize) {
      hasMore = false;
    }
  }
  
  console.log(`Total de ${allResults.length} registros carregados em ${batchCount} lotes`);
  return allResults;
}
