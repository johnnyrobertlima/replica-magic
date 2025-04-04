
import { supabase } from "@/integrations/supabase/client";
import { fetchInBatches } from "./batchQueryExecutor";
import { handleApiError } from "../errorHandlingService";

/**
 * Fetch all stock data from BLUEBAY_ESTOQUE
 */
export const fetchStockData = async () => {
  try {
    console.log("Buscando dados de estoque em lotes");
    return await fetchInBatches({
      table: "BLUEBAY_ESTOQUE",
      selectFields: "*",
      filters: { LOCAL: 1 },
      logPrefix: "Estoque"
    });
  } catch (error) {
    handleApiError("Erro ao buscar dados de estoque", error);
    return [];
  }
};

/**
 * Fetch item data in batches based on item codes
 */
export const fetchItemDataInBatches = async (itemCodes: string[]) => {
  try {
    console.log(`Buscando dados para ${itemCodes.length} itens em lotes`);
    const batchSize = 500; // Process in smaller chunks to avoid query param limits
    let allItemData = [];
    
    for (let i = 0; i < itemCodes.length; i += batchSize) {
      const batchCodes = itemCodes.slice(i, i + batchSize);
      console.log(`Processando lote ${i / batchSize + 1} com ${batchCodes.length} códigos de item`);
      
      const batchData = await fetchInBatches({
        table: "BLUEBAY_ITEM",
        selectFields: "*",
        conditions: [{ 
          type: 'in', 
          column: 'ITEM_CODIGO', 
          value: batchCodes
        }],
        logPrefix: `Itens (lote ${i / batchSize + 1})`
      });
      
      allItemData = [...allItemData, ...batchData];
    }
    
    return allItemData;
  } catch (error) {
    handleApiError("Erro ao buscar dados dos itens", error);
    return [];
  }
};

/**
 * Fetch stock items paginated - for fallback queries
 */
export const fetchStockItemsPaginated = async () => {
  try {
    console.log("Buscando itens de estoque com paginação");
    return await fetchInBatches({
      table: "BLUEBAY_ESTOQUE",
      selectFields: "*",
      filters: { LOCAL: 1 },
      logPrefix: "Estoque Paginado"
    });
  } catch (error) {
    handleApiError("Erro ao buscar itens de estoque paginados", error);
    return [];
  }
};

/**
 * Fetch item details in batches - fallback function
 */
export const fetchItemDetailsBatch = async (itemCodes: string[], batchSize = 500) => {
  return fetchItemDataInBatches(itemCodes);
};

/**
 * Fetch sales data (TIPO = S) in batches for the specified period
 */
export const fetchSalesDataInBatches = async (startDate: string, endDate: string) => {
  try {
    console.log(`Buscando dados de vendas para o período ${startDate} até ${endDate}`);
    return await fetchInBatches({
      table: "BLUEBAY_FATURAMENTO",
      selectFields: "*",
      filters: { TIPO: 'S' },
      conditions: [
        { type: 'gte', column: 'DATA_EMISSAO', value: startDate },
        { type: 'lte', column: 'DATA_EMISSAO', value: `${endDate} 23:59:59` }
      ],
      logPrefix: "Vendas"
    });
  } catch (error) {
    handleApiError("Erro ao buscar dados de vendas", error);
    return [];
  }
};

/**
 * Fetch sales data with pagination - for fallback
 */
export const fetchSalesDataPaginated = async (startDate: string, endDate: string) => {
  return fetchSalesDataInBatches(startDate, endDate);
};

/**
 * Fetch purchase data (TIPO = E, TRANSACAO = 200) in batches for the specified period
 */
export const fetchPurchaseDataInBatches = async (startDate: string, endDate: string) => {
  try {
    console.log(`Buscando dados de compras para o período ${startDate} até ${endDate}`);
    return await fetchInBatches({
      table: "BLUEBAY_FATURAMENTO",
      selectFields: "*",
      filters: { 
        TIPO: 'E',
        TRANSACAO: 200
      },
      conditions: [
        { type: 'gte', column: 'DATA_EMISSAO', value: startDate },
        { type: 'lte', column: 'DATA_EMISSAO', value: `${endDate} 23:59:59` }
      ],
      logPrefix: "Compras"
    });
  } catch (error) {
    handleApiError("Erro ao buscar dados de compras", error);
    return [];
  }
};
