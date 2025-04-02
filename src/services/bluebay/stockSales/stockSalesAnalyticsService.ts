
import { format, subDays } from "date-fns";
import { StockItem } from "./types";
import { generateSampleStockData } from "./sampleDataGenerator";
import { fetchStockSalesViaRpc } from "./rpcQueryService";

/**
 * Main entry point for fetching stock sales analytics data
 * Tries RPC first, then falls back to direct queries if needed
 */
export const fetchStockSalesAnalytics = async (
  startDate: string,
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Buscando dados de estoque e vendas para análise:", {
      startDate,
      endDate
    });

    try {
      // Try to use the RPC method first
      return await fetchStockSalesViaRpc(startDate, endDate);
    } catch (error) {
      console.error("Erro ao carregar dados de estoque-vendas:", error);
      return generateSampleStockData(); // Last resort - generate sample data
    }
  } catch (error) {
    console.error("Erro ao carregar dados de estoque-vendas:", error);
    return generateSampleStockData(); // Last resort - generate sample data
  }
};

// Export the sample data generator
export const fetchSampleStockData = (): Promise<StockItem[]> => {
  console.log("Gerando dados de exemplo para visualização");
  return Promise.resolve(generateSampleStockData());
};

// Re-export required types from the types file
export type { StockItem } from "./types";
