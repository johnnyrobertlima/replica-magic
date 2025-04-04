
import { handleApiError } from "../errorHandlingService";
import { fetchInBatches } from "./batchQueryExecutor";

/**
 * Fetch stock items with pagination and filtering
 */
export const fetchStockItemsPaginated = async () => {
  try {
    console.log("Iniciando busca paginada de itens de estoque com filtros LOCAL=1");
    
    // First, get all stock items with LOCAL=1
    const stockItems = await fetchInBatches({
      table: "BLUEBAY_ESTOQUE",
      selectFields: "*",
      filters: {
        "LOCAL": 1,
      },
      batchSize: 5000,
      logPrefix: "estoque paginado",
      count: true
    });
    
    if (!stockItems || stockItems.length === 0) {
      console.warn("Nenhum item de estoque encontrado com os filtros LOCAL=1");
      return [];
    }
    
    console.log(`Busca paginada: ${stockItems.length} itens de estoque obtidos com LOCAL=1`);
    return stockItems;
  } catch (error) {
    handleApiError("Erro ao buscar itens de estoque paginados", error);
    throw error;
  }
};
