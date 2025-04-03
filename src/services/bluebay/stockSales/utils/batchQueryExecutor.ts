
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../errorHandlingService";
import { SupabaseTable, QueryCondition, FetchBatchesParams } from "./queryTypes";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

/**
 * Função utilitária genérica para consultar dados em batches
 * Controla paginação com offset e limit
 */
export const fetchInBatches = async ({
  table,
  selectFields,
  filters = {},
  conditions = [],
  batchSize = 5000, // Aumentado para 5000 itens por lote para melhor desempenho
  logPrefix = "Dados",
  count = true
}: FetchBatchesParams): Promise<any[]> => {
  try {
    let offset = 0;
    let allData: any[] = [];
    let hasMore = true;
    let batchCount = 0;
    let totalProcessed = 0;
    
    console.log(`Iniciando busca em lotes para ${table}. Tamanho do lote: ${batchSize}`);
    
    // Se count=true, primeiro obter a contagem total para melhor controle
    let totalRecords = null;
    if (count) {
      // Inicializa a consulta com tipagem explícita para evitar recursão de tipos
      let countQuery = supabase
        .from(table)
        .select(selectFields, { count: 'exact' });
      
      // Aplica filtros por igualdade
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          countQuery = countQuery.eq(key, value);
        }
      }
      
      // Aplica condições adicionais com implementação inline
      for (const condition of conditions) {
        switch (condition.type) {
          case 'gt':
            countQuery = countQuery.gt(condition.column, condition.value);
            break;
          case 'lt':
            countQuery = countQuery.lt(condition.column, condition.value);
            break;
          case 'gte':
            countQuery = countQuery.gte(condition.column, condition.value);
            break;
          case 'lte':
            countQuery = countQuery.lte(condition.column, condition.value);
            break;
          case 'in':
            countQuery = countQuery.in(condition.column, condition.value);
            break;
        }
      }
      
      const { count: exactCount, error: countError } = await countQuery;
      
      if (countError) {
        console.error(`Erro ao obter contagem para ${table}:`, countError);
      } else if (exactCount !== null) {
        totalRecords = exactCount;
        console.log(`Total estimado de registros em ${table}: ${totalRecords}`);
      }
    }
    
    while (hasMore) {
      batchCount++;
      console.log(`Buscando lote ${batchCount} de ${logPrefix} (offset: ${offset}, tamanho: ${batchSize})`);
      
      // Inicia a consulta básica com tipagem explícita
      let query = supabase
        .from(table)
        .select(selectFields, { count: 'exact' });
      
      // Aplica a paginação
      query = query.range(offset, offset + batchSize - 1);
      
      // Aplica filtros por igualdade
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
      
      // Aplica condições adicionais com implementação inline
      for (const condition of conditions) {
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
      
      // Executa a consulta
      const { data, error, count: resultCount } = await query;
      
      if (error) {
        console.error(`Erro ao buscar lote ${batchCount} de ${logPrefix}:`, error);
        throw error;
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
        
        if (totalRecords) {
          console.log(`Progresso: ${totalProcessed}/${totalRecords} (${Math.round(totalProcessed/totalRecords*100)}%)`);
        }
      }
    }
    
    console.log(`Total de ${totalProcessed} registros de ${logPrefix} carregados em ${batchCount} lotes`);
    return allData;
  } catch (error) {
    handleApiError(`Erro ao buscar dados de ${logPrefix} em lotes`, error);
    throw error;
  }
};
