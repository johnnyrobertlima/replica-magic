
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { StockItem } from "./types";
import { generateSampleStockData } from "./sampleDataGenerator";
import { fetchStockSalesWithDirectQueries } from "./directQueriesService";

/**
 * Fetches stock sales analytics data using the RPC function
 * Falls back to direct queries or sample data if the RPC fails
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

    // Calculate the date 60 days ago for identifying new products
    const sixtyDaysAgo = format(subDays(new Date(), 60), 'yyyy-MM-dd');
    
    try {
      // Query using the custom function with type cast to bypass TypeScript error
      const { data, error } = await supabase
        .rpc('get_stock_sales_analytics' as any, { 
          p_start_date: startDate,
          p_end_date: endDate,
          p_new_product_date: sixtyDaysAgo
        });

      if (error) {
        console.error("Erro ao buscar dados de análise de estoque e vendas:", error);
        throw error;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.info("Nenhum dado de análise de estoque e vendas encontrado para o período");
        return generateSampleStockData();
      }
      
      console.info(`Buscados ${data.length} registros de análise de estoque e vendas`);
      
      // Cast the data to StockItem[] after confirming it's an array
      return data as unknown as StockItem[];
    } catch (rpcError) {
      console.error("Erro ao usar função RPC para dados de estoque-vendas:", rpcError);
      
      // Fallback to alternative method: using direct queries
      return await fetchStockSalesWithDirectQueries(startDate, endDate);
    }
  } catch (error) {
    console.error("Erro ao carregar dados de estoque-vendas:", error);
    return generateSampleStockData();
  }
};

// Re-export the sample data generator to maintain the same public API
export { generateSampleStockData as fetchSampleStockData } from "./sampleDataGenerator";

// Export required types from the types file
export type { StockItem } from "./types";
