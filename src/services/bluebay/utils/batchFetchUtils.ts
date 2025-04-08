
import { PostgrestError, PostgrestResponse } from '@supabase/supabase-js';

/**
 * Busca dados em lotes para otimizar consultas grandes
 */
export async function fetchInBatches<T>(
  fetchBatchFunction: (offset: number, limit: number) => Promise<PostgrestResponse<T>>,
  batchSize: number = 1000
): Promise<T[]> {
  let allData: T[] = [];
  let offset = 0;
  let hasMore = true;
  let batchCount = 0;
  let error: PostgrestError | null = null;

  try {
    while (hasMore) {
      batchCount++;
      console.log(`Buscando lote ${batchCount} (offset: ${offset}, tamanho: ${batchSize})`);
      
      const response = await fetchBatchFunction(offset, batchSize);
      
      if (response.error) {
        error = response.error;
        console.error(`Erro ao buscar lote ${batchCount}:`, response.error);
        break;
      }
      
      const batchData = response.data || [];
      
      if (batchData.length === 0) {
        console.log(`Nenhum dado encontrado no lote ${batchCount}`);
        hasMore = false;
        break;
      }
      
      allData = [...allData, ...batchData];
      console.log(`Processado lote ${batchCount}: ${batchData.length} registros. Total acumulado: ${allData.length}`);
      
      // Verifica se há mais dados para buscar
      hasMore = batchData.length === batchSize;
      offset += batchSize;
    }
    
    console.log(`Total de ${allData.length} registros carregados em ${batchCount} lotes`);
    return allData;
  } catch (err) {
    console.error("Erro durante a busca em lote:", err);
    throw err;
  }
}
