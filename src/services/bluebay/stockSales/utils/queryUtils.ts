
import { supabase } from "@/integrations/supabase/client";
import { generateSampleStockData } from "../sampleDataGenerator";
import { handleApiError } from "../errorHandlingService";

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
}) => {
  try {
    let offset = 0;
    let allData = [];
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
      
      // Aplica condições adicionais (gt, lt, gte, lte, in, etc)
      for (const condition of conditions) {
        const { type, column, value } = condition;
        switch (type) {
          case 'gt':
            query = query.gt(column, value);
            break;
          case 'lt':
            query = query.lt(column, value);
            break;
          case 'gte':
            query = query.gte(column, value);
            break;
          case 'lte':
            query = query.lte(column, value);
            break;
          case 'in':
            query = query.in(column, value);
            break;
          // Adicione outros operadores conforme necessário
        }
      }
      
      // Executa a consulta
      const { data, error, count } = await query;
      
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
 * Fetch stock data with error handling
 */
export const fetchStockData = async () => {
  try {
    const stockData = await fetchInBatches({
      table: 'BLUEBAY_ESTOQUE',
      selectFields: `
        "ITEM_CODIGO",
        "FISICO",
        "DISPONIVEL",
        "RESERVADO",
        "ENTROU",
        "LIMITE"
      `,
      filters: { LOCAL: 1 },
      batchSize: 5000,
      logPrefix: "estoque"
    });
    
    if (!stockData || stockData.length === 0) {
      console.warn("Nenhum dado de estoque encontrado");
      return [];
    }
    
    console.log(`Encontrados ${stockData.length} registros de estoque`);
    return stockData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de estoque", error);
    throw error;
  }
};

/**
 * Fetch item data in batches for given item codes
 */
export const fetchItemDataInBatches = async (itemCodes) => {
  try {
    if (!itemCodes || itemCodes.length === 0) {
      console.warn("Nenhum código de item fornecido para busca");
      return [];
    }
    
    // Processa em blocos de 1000 códigos de itens por vez (limitação do Supabase)
    const batchSize = 1000;
    let allItemData = [];
    let batchesCount = Math.ceil(itemCodes.length / batchSize);
    
    console.log(`Iniciando busca de ${itemCodes.length} itens em ${batchesCount} lotes`);
    
    for (let i = 0; i < itemCodes.length; i += batchSize) {
      const batchCodes = itemCodes.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      
      console.log(`Processando lote ${currentBatch}/${batchesCount} de itens (${batchCodes.length} códigos)`);
      
      try {
        const batchData = await fetchInBatches({
          table: 'BLUEBAY_ITEM',
          selectFields: `
            "ITEM_CODIGO",
            "DESCRICAO",
            "GRU_DESCRICAO",
            "DATACADASTRO"
          `,
          conditions: [
            { type: 'in', column: 'ITEM_CODIGO', value: batchCodes }
          ],
          batchSize: 1000,
          logPrefix: `itens (lote ${currentBatch}/${batchesCount})`
        });
        
        if (batchData && batchData.length > 0) {
          allItemData = [...allItemData, ...batchData];
          console.log(`Adicionados ${batchData.length} itens do lote ${currentBatch}. Total: ${allItemData.length}`);
        } else {
          console.warn(`Nenhum item encontrado no lote ${currentBatch}`);
        }
      } catch (batchError) {
        console.error(`Erro ao processar lote ${currentBatch} de itens:`, batchError);
        // Continua processando os outros lotes mesmo com erro
      }
    }
    
    console.log(`Concluído: ${allItemData.length} itens carregados de ${itemCodes.length} códigos`);
    return allItemData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de itens em lote", error);
    throw error;
  }
};

/**
 * Fetch sales data in batches for a specified date range
 */
export const fetchSalesDataInBatches = async (startDate, endDate) => {
  try {
    console.log(`Buscando dados de vendas para o período ${startDate} até ${endDate}`);
    
    const salesData = await fetchInBatches({
      table: 'BLUEBAY_FATURAMENTO',
      selectFields: `
        "ITEM_CODIGO",
        "QUANTIDADE",
        "VALOR_UNITARIO",
        "DATA_EMISSAO"
      `,
      filters: { TIPO: 'S' },
      conditions: [
        { type: 'gte', column: 'DATA_EMISSAO', value: startDate },
        { type: 'lte', column: 'DATA_EMISSAO', value: `${endDate}T23:59:59` }
      ],
      batchSize: 5000,
      logPrefix: "vendas"
    });
    
    console.log(`Total de ${salesData.length} registros de vendas encontrados`);
    return salesData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de vendas em lote", error);
    throw error;
  }
};

/**
 * Fetch stock items in paginated batches
 */
export const fetchStockItemsPaginated = async () => {
  try {
    const stockItems = await fetchInBatches({
      table: "BLUEBAY_ESTOQUE",
      selectFields: "*",
      filters: { LOCAL: 1 },
      batchSize: 5000,
      logPrefix: "estoque paginado"
    });
    
    return stockItems;
  } catch (error) {
    handleApiError("Erro ao buscar itens de estoque paginados", error);
    throw error;
  }
};

/**
 * Fetch batch of item details by item codes
 */
export const fetchItemDetailsBatch = async (itemCodes, batchSize = 500) => {
  try {
    if (!itemCodes || itemCodes.length === 0) {
      return [];
    }
    
    let allItemDetails = [];
    let batchesProcessed = 0;
    const totalBatches = Math.ceil(itemCodes.length / batchSize);
    
    for (let i = 0; i < itemCodes.length; i += batchSize) {
      const batchCodes = itemCodes.slice(i, i + batchSize);
      batchesProcessed++;
      
      console.log(`Processando lote ${batchesProcessed}/${totalBatches} de detalhes de itens (${batchCodes.length} códigos)`);
      
      try {
        const itemDetails = await fetchInBatches({
          table: "BLUEBAY_ITEM",
          selectFields: "*",
          conditions: [
            { type: 'in', column: 'ITEM_CODIGO', value: batchCodes }
          ],
          batchSize: 1000,
          logPrefix: `detalhes de itens (lote ${batchesProcessed}/${totalBatches})`
        });
        
        if (itemDetails && itemDetails.length > 0) {
          allItemDetails = [...allItemDetails, ...itemDetails];
          console.log(`Adicionados ${itemDetails.length} detalhes do lote ${batchesProcessed}. Total: ${allItemDetails.length}`);
        }
      } catch (batchError) {
        console.error(`Erro no lote ${batchesProcessed} de detalhes:`, batchError);
        // Continua processando os outros lotes
      }
    }
    
    console.log(`Concluído: ${allItemDetails.length} detalhes de itens carregados`);
    return allItemDetails;
  } catch (error) {
    handleApiError("Erro ao buscar detalhes de itens em lote", error);
    throw error;
  }
};

/**
 * Fetch paginated sales data for a date range
 */
export const fetchSalesDataPaginated = async (startDate, endDate) => {
  try {
    console.log(`Iniciando busca paginada de dados de vendas para o período ${startDate} a ${endDate}`);
    
    const salesData = await fetchInBatches({
      table: "BLUEBAY_FATURAMENTO",
      selectFields: "*",
      filters: { TIPO: "S" },
      conditions: [
        { type: 'gte', column: 'DATA_EMISSAO', value: startDate },
        { type: 'lte', column: 'DATA_EMISSAO', value: `${endDate}T23:59:59` }
      ],
      batchSize: 5000,
      logPrefix: "vendas paginadas"
    });
    
    console.log(`Total final: ${salesData.length} registros de vendas carregados`);
    return salesData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de vendas paginados", error);
    throw error;
  }
};
