
import { PostgrestError } from "@supabase/supabase-js";

/**
 * Busca dados em lotes para superar o limite de 1000 registros por consulta do Supabase
 * Função genérica que pode ser reutilizada em diferentes serviços
 */
export const fetchInBatches = async <T>(
  query: (offset: number, limit: number) => Promise<{ data: T[] | null, error: PostgrestError | null, count?: number | null }>,
  batchSize: number = 1000, // O limite padrão do Supabase é 1000, então usamos isso como tamanho do lote
  maxBatches: number = 1000 // Limite de segurança para evitar loops infinitos
): Promise<T[]> => {
  let allData: T[] = [];
  let hasMore = true;
  let offset = 0;
  let batchCount = 0;
  
  while (hasMore && batchCount < maxBatches) {
    batchCount++;
    console.log(`Buscando lote ${batchCount} (offset: ${offset}, tamanho: ${batchSize})`);
    
    try {
      const { data, error } = await query(offset, batchSize);
      
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
        
        // Continua buscando se o número de registros retornados for igual ao tamanho do lote
        // Esta é a correção principal: no Supabase, precisamos continuar mesmo quando recebemos exatamente 1000 registros
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
