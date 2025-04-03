
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
      // Evita a recursão excessiva usando tipagem explícita
      const countQuery = supabase.from(table);
      let typedCountQuery = countQuery.select(selectFields, { count: 'exact' });
      
      // Aplica filtros por igualdade manualmente
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          typedCountQuery = typedCountQuery.eq(key, value);
        }
      }
      
      // Aplica condições adicionais diretamente
      for (const condition of conditions) {
        if (condition.type === 'gt') {
          typedCountQuery = typedCountQuery.gt(condition.column, condition.value);
        } else if (condition.type === 'lt') {
          typedCountQuery = typedCountQuery.lt(condition.column, condition.value);
        } else if (condition.type === 'gte') {
          typedCountQuery = typedCountQuery.gte(condition.column, condition.value);
        } else if (condition.type === 'lte') {
          typedCountQuery = typedCountQuery.lte(condition.column, condition.value);
        } else if (condition.type === 'in') {
          typedCountQuery = typedCountQuery.in(condition.column, condition.value);
        }
      }
      
      const { count: exactCount, error: countError } = await typedCountQuery;
      
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
      
      // Evita recursão usando abordagem similar à contagem
      const baseQuery = supabase.from(table);
      let query = baseQuery.select(selectFields, { count: 'exact' });
      
      // Aplica a paginação
      query = query.range(offset, offset + batchSize - 1);
      
      // Aplica filtros por igualdade
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      }
      
      // Aplica condições adicionais diretamente
      for (const condition of conditions) {
        if (condition.type === 'gt') {
          query = query.gt(condition.column, condition.value);
        } else if (condition.type === 'lt') {
          query = query.lt(condition.column, condition.value);
        } else if (condition.type === 'gte') {
          query = query.gte(condition.column, condition.value);
        } else if (condition.type === 'lte') {
          query = query.lte(condition.column, condition.value);
        } else if (condition.type === 'in') {
          query = query.in(condition.column, condition.value);
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
