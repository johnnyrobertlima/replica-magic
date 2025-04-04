
/**
 * Main data processing utilities for stock and sales analytics
 */
import { StockItem } from "./types";
import { groupSalesByItem } from "./utils/salesDataProcessor";
import { processCostData } from "./utils/costDataProcessor";
import { createItemDetailsMap, mapStockItems } from "./utils/stockItemMapper";
import { assignRankings } from "./utils/rankingUtils";
import { logDebugInfo } from "./utils/debugLogger";

/**
 * Process stock and sales data from direct queries
 */
export const processStockAndSalesData = (
  stockItems: any[], 
  salesData: any[],
  costData: any[],
  newProductDate: string,
  startDate: string,
  endDate: string
): StockItem[] => {
  // Group sales data by item code
  const salesByItem = groupSalesByItem(salesData);

  // Process cost data to create a lookup map
  const costByItem = processCostData(costData);
  
  // Calculate date range for average daily sales
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const daysDiff = Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Track processed item codes to avoid duplicates
  const processedItemCodes = new Set<string>();
  
  // Create a map of item details for lookup
  const itemDetailsMap = createItemDetailsMap(stockItems);
  
  // Process stock items with sales data
  const processedItems = mapStockItems(
    stockItems,
    salesByItem,
    costByItem,
    itemDetailsMap,
    daysDiff,
    newProductDate,
    processedItemCodes
  );
  
  // Assign rankings and return the result
  return assignRankings(processedItems);
};

// Re-export the assignRankings function for backward compatibility
export { assignRankings } from "./utils/rankingUtils";
