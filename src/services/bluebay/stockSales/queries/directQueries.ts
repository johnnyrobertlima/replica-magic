
import { format, subDays } from "date-fns";
import { StockItem } from "../types";
import { generateSampleStockData } from "../sampleDataGenerator";
import { handleApiError } from "../errorHandlingService";
import { processStockAndSalesData } from "../dataProcessingUtils";
import {
  fetchStockData,
  fetchItemDataInBatches,
  fetchSalesDataInBatches
} from "../utils/queryUtils";

/**
 * Direct method to fetch stock and sales data using immediate queries
 */
export const fetchStockSalesWithDirectQueries = async (
  startDate: string,
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Usando consultas diretas para buscar dados de estoque e vendas");
    
    // Calculate the date 60 days ago for identifying new products
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const newProductDate = sixtyDaysAgo.toISOString().split('T')[0];
    
    try {
      // Using a batched approach for potentially large datasets
      // First, get all stock data with a large limit
      const stockData = await fetchStockData();
      
      if (stockData.length === 0) {
        return generateSampleStockData();
      }
      
      // Extract item codes for item data lookup
      const itemCodes = stockData.map(item => item.ITEM_CODIGO);
      
      // Fetch item data for the stock items in batches
      const allItemData = await fetchItemDataInBatches(itemCodes);
      
      if (allItemData.length === 0) {
        console.error("Não foi possível obter dados dos itens");
        return generateSampleStockData();
      }
      
      console.log(`Obtidos dados para ${allItemData.length} itens de ${itemCodes.length} códigos`);
      
      // Create a map of item data for easy lookup
      const itemMap = new Map();
      allItemData.forEach(item => {
        itemMap.set(item.ITEM_CODIGO, item);
      });
      
      // Combine stock data with item data
      const combinedStockData = stockData.map(stockItem => {
        const item = itemMap.get(stockItem.ITEM_CODIGO);
        return {
          ...stockItem,
          BLUEBAY_ITEM: item || {
            DESCRICAO: 'Desconhecido',
            GRU_DESCRICAO: 'Sem Grupo',
            DATACADASTRO: null
          }
        };
      });
      
      // Fetch sales data for the specified period
      console.log(`Buscando dados de vendas para o período ${startDate} até ${endDate}`);
      const allSalesData = await fetchSalesDataInBatches(startDate, endDate);
      
      // Process the data to calculate analytics
      return processStockAndSalesData(combinedStockData, allSalesData, newProductDate, startDate, endDate);
      
    } catch (queryError) {
      handleApiError("Erro ao buscar dados diretos", queryError);
      return generateSampleStockData();
    }
  } catch (error) {
    handleApiError("Erro ao buscar dados diretos", error);
    return generateSampleStockData();
  }
};
