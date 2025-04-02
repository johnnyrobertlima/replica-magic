
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../errorHandlingService";
import { SupabaseTable, QueryCondition, FetchBatchesParams } from "./queryTypes";

/**
 * Função utilitária genérica para consultar dados em batches
 * Controla paginação com offset e limit
 */
export const fetchInBatches = async ({
  table,
  selectFields,
  filters = {},
  conditions = [],
  batchSize = 1000,
  logPrefix = "Dados"
}: FetchBatchesParams): Promise<any[]> => {
  try {
    let offset = 0;
    let allData: any[] = [];
    let hasMore = true;
    let batchCount = 0;
    let totalProcessed = 0;
    
    while (hasMore) {
      batchCount++;
      console.log(`Buscando lote ${batchCount} de ${logPrefix} (offset: ${offset}, tamanho: ${batchSize})`);
      
      // Inicia a consulta
      let query = supabase
        .from(table)
        .select(selectFields)
        .range(offset, offset + batchSize - 1);
      
      // Aplica filtros por igualdade
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
      
      // Aplica condições adicionais sem causar problemas de recursão de tipos
      if (conditions && conditions.length > 0) {
        query = manuallyApplyConditions(query, conditions);
      }
      
      // Executa a consulta
      const { data, error } = await query;
      
      if (error) {
        console.error(`Erro ao buscar lote ${batchCount} de ${logPrefix}:`, error);
        hasMore = false;
        continue;
      }
      
      if (!data || data.length === 0) {
        console.log(`Nenhum dado encontrado no lote ${batchCount} de ${logPrefix}`);
        hasMore = false;
      } else {
        allData = [...allData, ...data];
        totalProcessed += data.length;
        offset += batchSize;
        
        // Verifica se ainda tem mais dados para buscar
        hasMore = data.length === batchSize;
        
        console.log(`Processado lote ${batchCount} de ${logPrefix}: ${data.length} registros. Total acumulado: ${totalProcessed}`);
      }
    }
    
    console.log(`Total de ${totalProcessed} registros de ${logPrefix} carregados em ${batchCount} lotes`);
    return allData;
  } catch (error) {
    handleApiError(`Erro ao buscar dados de ${logPrefix} em lotes`, error);
    throw error;
  }
};

/**
 * Função auxiliar que aplica condições à query de forma manual
 * para evitar problemas de instanciação de tipos excessivamente profunda
 */
function manuallyApplyConditions(query: any, conditions: QueryCondition[]): any {
  // Usamos uma abordagem mais direta sem encadeamento complexo
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    
    // Usar switch em vez de encadeamento de métodos
    switch (condition.type) {
      case 'gt':
        query = query.gt(condition.column, condition.value);
        break;
      case 'lt':
        query = query.lt(condition.column, condition.value);
        break;
      case 'gte':
        query = query.gte(condition.column, condition.value);
        break;
      case 'lte':
        query = query.lte(condition.column, condition.value);
        break;
      case 'in':
        query = query.in(condition.column, condition.value);
        break;
    }
  }
  
  return query;
}
