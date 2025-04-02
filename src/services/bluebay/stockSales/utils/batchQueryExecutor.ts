
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
      
      // Aplica condições adicionais com uma abordagem que evita problemas de tipos
      if (conditions && conditions.length > 0) {
        query = applyConditionsManually(query, conditions);
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
 * Aplica condições de forma manual para evitar recursão infinita de tipos
 * Esta implementação usa uma abordagem de baixo nível para aplicar as condições
 * sem criar uma cadeia de retornos de tipos que possa confundir o TypeScript
 */
function applyConditionsManually(query: any, conditions: QueryCondition[]): any {
  // Cria uma cópia da query para manipulação
  let resultQuery = query;
  
  // Aplica cada condição individualmente
  for (let i = 0; i < conditions.length; i++) {
    const condition = conditions[i];
    
    // Usa condicionais if/else em vez de switch para mais clareza
    if (condition.type === 'gt') {
      resultQuery = resultQuery.gt(condition.column, condition.value);
    } 
    else if (condition.type === 'lt') {
      resultQuery = resultQuery.lt(condition.column, condition.value);
    }
    else if (condition.type === 'gte') {
      resultQuery = resultQuery.gte(condition.column, condition.value);
    }
    else if (condition.type === 'lte') {
      resultQuery = resultQuery.lte(condition.column, condition.value);
    }
    else if (condition.type === 'in') {
      resultQuery = resultQuery.in(condition.column, condition.value);
    }
  }
  
  return resultQuery;
}
