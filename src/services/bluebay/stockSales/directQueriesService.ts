
import { supabase } from "@/integrations/supabase/client";
import { StockItem } from "./types";
import { processStockAndSalesData } from "./dataProcessingUtils";
import { generateSampleStockData } from "./sampleDataGenerator";

/**
 * Fetches stock and sales data directly from the database tables
 * Used as a fallback if the RPC function fails
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
      // Fetch stock data with related item information
      const { data: stockData, error: stockError } = await supabase
        .from('BLUEBAY_ESTOQUE')
        .select(`
          ITEM_CODIGO,
          FISICO,
          DISPONIVEL,
          RESERVADO,
          ENTROU,
          LIMITE,
          BLUEBAY_ITEM:ITEM_CODIGO(
            DESCRICAO,
            GRU_DESCRICAO,
            DATACADASTRO
          )
        `)
        .eq('LOCAL', 1);
      
      if (stockError) {
        console.error("Erro ao buscar dados de estoque:", stockError);
        return generateSampleStockData();
      }
      
      if (!stockData || stockData.length === 0) {
        console.warn("Nenhum dado de estoque encontrado");
        return generateSampleStockData();
      }
      
      // Fetch sales data for the specified period
      const { data: salesData, error: salesError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select(`
          ITEM_CODIGO,
          QUANTIDADE,
          VALOR_UNITARIO,
          DATA_EMISSAO
        `)
        .eq('TIPO', 'S')
        .gte('DATA_EMISSAO', startDate)
        .lte('DATA_EMISSAO', `${endDate}T23:59:59`);
      
      if (salesError) {
        console.error("Erro ao buscar dados de vendas:", salesError);
        return generateSampleStockData();
      }
      
      // Process the data to calculate analytics
      return processStockAndSalesData(stockData, salesData || [], newProductDate, startDate, endDate);
      
    } catch (queryError) {
      console.error("Erro ao buscar dados diretos:", queryError);
      return generateSampleStockData();
    }
  } catch (error) {
    console.error("Erro ao buscar dados diretos:", error);
    return generateSampleStockData();
  }
};
