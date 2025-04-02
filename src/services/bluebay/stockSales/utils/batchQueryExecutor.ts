
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
      
      // Aplica condições adicionais usando um loop simples para evitar problemas de tipos
      if (conditions && conditions.length > 0) {
        query = applyConditionsSimple(query, conditions);
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
 * Aplica condições à query de forma simples sem encadeamento complexo
 * Eliminando o problema de instanciação de tipos excessiva
 */
function applyConditionsSimple(query: any, conditions: QueryCondition[]): any {
  // Evitamos usar métodos que retornam o mesmo objeto para evitar recursão em tipos
  let currentQuery = query;
  
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    
    if (condition.type === 'gt') {
      currentQuery = currentQuery.gt(condition.column, condition.value);
    } 
    else if (condition.type === 'lt') {
      currentQuery = currentQuery.lt(condition.column, condition.value);
    }
    else if (condition.type === 'gte') {
      currentQuery = currentQuery.gte(condition.column, condition.value);
    }
    else if (condition.type === 'lte') {
      currentQuery = currentQuery.lte(condition.column, condition.value);
    }
    else if (condition.type === 'in') {
      currentQuery = currentQuery.in(condition.column, condition.value);
    }
  }
  
  return currentQuery;
}
