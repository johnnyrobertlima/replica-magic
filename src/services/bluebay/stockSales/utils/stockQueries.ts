
import { handleApiError } from "../errorHandlingService";
import { fetchInBatches } from "./batchQueryExecutor";

/**
 * Fetch stock data with error handling - without any filtering
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
      // No filters applied so we get ALL stock items
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
 * Fetch stock items in paginated batches - without any filtering
 */
export const fetchStockItemsPaginated = async (): Promise<any[]> => {
  try {
    const stockItems = await fetchInBatches({
      table: "BLUEBAY_ESTOQUE",
      selectFields: "*",
      // No filters applied so we get ALL stock items
      batchSize: 5000,
      logPrefix: "estoque paginado"
    });
    
    return stockItems;
  } catch (error) {
    handleApiError("Erro ao buscar itens de estoque paginados", error);
    throw error;
  }
};
