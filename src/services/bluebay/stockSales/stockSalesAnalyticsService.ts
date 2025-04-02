
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
      // Query using the custom function with count option enabled and no limit
      const { data, error, count } = await supabase
        .rpc('get_stock_sales_analytics', { 
          p_start_date: startDate,
          p_end_date: endDate,
          p_new_product_date: sixtyDaysAgo
        })
        .returns<any[]>() // Use generic type to avoid type issues
        .limit(100000) // Aumentar substancialmente o limite (100.000 registros)
        .throwOnError(); // Lançar erro explicitamente para melhor tratamento

      if (!data || !Array.isArray(data) || data.length === 0) {
        console.info("Nenhum dado de análise de estoque e vendas encontrado para o período");
        // Try the direct queries approach before falling back to sample data
        const directQueryData = await fetchStockSalesWithDirectQueries(startDate, endDate);
        if (directQueryData.length > 0) {
          return directQueryData;
        }
        return generateSampleStockData();
      }
      
      console.info(`Buscados ${data.length} registros de análise de estoque e vendas`);
      
      // Transform the data from lowercase properties to uppercase to match our StockItem type
      const transformedData: StockItem[] = data.map(item => ({
        ITEM_CODIGO: item.item_codigo,
        DESCRICAO: item.descricao,
        GRU_DESCRICAO: item.gru_descricao,
        DATACADASTRO: item.datacadastro,
        FISICO: item.fisico,
        DISPONIVEL: item.disponivel,
        RESERVADO: item.reservado,
        ENTROU: item.entrou,
        LIMITE: item.limite,
        QTD_VENDIDA: item.qtd_vendida,
        VALOR_TOTAL_VENDIDO: item.valor_total_vendido,
        DATA_ULTIMA_VENDA: item.data_ultima_venda,
        GIRO_ESTOQUE: item.giro_estoque,
        PERCENTUAL_ESTOQUE_VENDIDO: item.percentual_estoque_vendido,
        DIAS_COBERTURA: item.dias_cobertura,
        PRODUTO_NOVO: item.produto_novo,
        RANKING: item.ranking
      }));
      
      return transformedData;
    } catch (rpcError) {
      console.error("Erro ao usar função RPC para dados de estoque-vendas:", rpcError);
      
      // Fallback to alternative method: using direct queries
      const directQueryData = await fetchStockSalesWithDirectQueries(startDate, endDate);
      if (directQueryData.length > 0) {
        return directQueryData;
      }
      return generateSampleStockData();
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
