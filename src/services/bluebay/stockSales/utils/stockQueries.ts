
import { handleApiError } from "../errorHandlingService";
import { fetchInBatches } from "./batchQueryExecutor";

/**
 * Fetch stock data with error handling
 */
export const fetchStockData = async (): Promise<any[]> => {
  try {
    const stockData = await fetchInBatches({
      table: "BLUEBAY_ESTOQUE",
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
 * Fetch stock items in paginated batches
 */
export const fetchStockItemsPaginated = async (): Promise<any[]> => {
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
