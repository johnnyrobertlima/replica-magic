
import { handleApiError } from "../errorHandlingService";
import { fetchInBatches } from "./batchQueryExecutor";

/**
 * Fetch stock data with error handling - with specific LOCAL and FISICO filtering
 */
export const fetchStockData = async (): Promise<any[]> => {
  try {
    console.log("Iniciando busca de dados de estoque com filtros LOCAL=1 e FISICO>0");
    
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
      filters: {
        "LOCAL": 1, // Filter for LOCAL = 1
      },
      conditions: [
        {
          type: 'gt',
          column: 'FISICO',
          value: 0 // Filter for FISICO > 0
        }
      ],
      batchSize: 5000, // Increased batch size for more efficient loading
      logPrefix: "estoque"
    });
    
    if (!stockData || stockData.length === 0) {
      console.warn("Nenhum dado de estoque encontrado com os filtros aplicados");
      return [];
    }
    
    console.log(`Encontrados ${stockData.length} registros de estoque com LOCAL=1 e FISICO>0`);
    return stockData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de estoque", error);
    throw error;
  }
};

/**
 * Fetch stock items in paginated batches - with specific LOCAL and FISICO filtering
 */
export const fetchStockItemsPaginated = async (): Promise<any[]> => {
  try {
    console.log("Iniciando busca paginada de itens de estoque com filtros LOCAL=1 e FISICO>0");
    
    const stockItems = await fetchInBatches({
      table: "BLUEBAY_ESTOQUE",
      selectFields: "*",
      filters: {
        "LOCAL": 1, // Filter for LOCAL = 1
      },
      conditions: [
        {
          type: 'gt',
          column: 'FISICO',
          value: 0 // Filter for FISICO > 0
        }
      ],
      batchSize: 5000, // Increased batch size
      logPrefix: "estoque paginado"
    });
    
    console.log(`Busca paginada: ${stockItems.length} itens de estoque obtidos com LOCAL=1 e FISICO>0`);
    return stockItems;
  } catch (error) {
    handleApiError("Erro ao buscar itens de estoque paginados", error);
    throw error;
  }
};
