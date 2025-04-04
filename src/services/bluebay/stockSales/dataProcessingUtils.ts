
/**
 * Main data processing utilities for stock and sales analytics
 * This file now serves as a barrel export file, re-exporting from more focused modules
 */
import { StockItem } from "./types";
import { processStockAndSalesData } from "./processors/stockSalesProcessor";
import { assignRankings } from "./utils/rankingUtils";

// Re-export the main processing function
export { processStockAndSalesData };

// Re-export the assignRankings function for backward compatibility
export { assignRankings } from "./utils/rankingUtils";
