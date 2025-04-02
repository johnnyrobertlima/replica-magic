
import { format, subDays } from "date-fns";
import { StockItem } from "../types";
import { generateSampleStockData } from "../sampleDataGenerator";
import { handleApiError } from "../errorHandlingService";
import { processStockAndSalesData } from "../dataProcessingUtils";
import {
  fetchStockItemsPaginated,
  fetchItemDetailsBatch,
  fetchSalesDataPaginated
} from "../utils/queryUtils";

/**
 * Paginated fallback method to fetch stock and sales data
 */
export const fetchStockSalesWithPagination = async (
  startDate: string,
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Executando método alternativo com consultas diretas paginadas");
    
    // Calculate the date 60 days ago for identifying new products
    const sixtyDaysAgo = format(subDays(new Date(), 60), 'yyyy-MM-dd');
    
    // First, get all estoque items (paginated)
    const allStockItems = await fetchStockItemsPaginated();
    
    if (allStockItems.length === 0) {
      console.warn("Nenhum item de estoque encontrado");
      return generateSampleStockData();
    }
    
    // Extract item codes to fetch item details
    const itemCodes = [...new Set(allStockItems.map(item => item.ITEM_CODIGO))];
    console.log(`Buscando detalhes para ${itemCodes.length} códigos de itens`);
    
    // Fetch item details in batches
    const allItemDetails = await fetchItemDetailsBatch(itemCodes);
    
    console.log(`Obtidos detalhes para ${allItemDetails.length} itens`);
    
    // Create a map for item details lookup
    const itemDetailsMap = new Map();
    allItemDetails.forEach(item => {
      itemDetailsMap.set(item.ITEM_CODIGO, item);
    });
    
    // Fetch sales data for the period in batches
    const allSalesData = await fetchSalesDataPaginated(startDate, endDate);
    
    // Process the data using the utility function
    const combinedData = processStockAndSalesData(
      allStockItems,
      allSalesData,
      sixtyDaysAgo,
      startDate,
      endDate
    );
    
    console.log(`Processados ${combinedData.length} itens com estoque e vendas`);
    return combinedData;
  } catch (error) {
    handleApiError("Falha nas consultas diretas paginadas", error);
    return generateSampleStockData(); // Last resort - generate sample data
  }
};
