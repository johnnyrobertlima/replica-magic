
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
      // Fetch stock data
      const { data: stockData, error: stockError } = await supabase
        .from('BLUEBAY_ESTOQUE')
        .select(`
          "ITEM_CODIGO",
          "FISICO",
          "DISPONIVEL",
          "RESERVADO",
          "ENTROU",
          "LIMITE"
        `)
        .eq('LOCAL', 1)
        .limit(100000); // Aumentar substancialmente o limite
      
      if (stockError) {
        console.error("Erro ao buscar dados de estoque:", stockError);
        return generateSampleStockData();
      }
      
      if (!stockData || stockData.length === 0) {
        console.warn("Nenhum dado de estoque encontrado");
        return generateSampleStockData();
      }
      
      // Fetch item data for the stock items
      const itemCodes = stockData.map(item => item.ITEM_CODIGO);
      const { data: itemData, error: itemError } = await supabase
        .from('BLUEBAY_ITEM')
        .select(`
          "ITEM_CODIGO",
          "DESCRICAO",
          "GRU_DESCRICAO",
          "DATACADASTRO"
        `)
        .in('ITEM_CODIGO', itemCodes)
        .limit(100000); // Aumentar substancialmente o limite
      
      if (itemError) {
        console.error("Erro ao buscar dados de itens:", itemError);
        return generateSampleStockData();
      }
      
      // Create a map of item data for easy lookup
      const itemMap = new Map();
      itemData?.forEach(item => {
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
      const { data: salesData, error: salesError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select(`
          "ITEM_CODIGO",
          "QUANTIDADE",
          "VALOR_UNITARIO",
          "DATA_EMISSAO"
        `)
        .eq('TIPO', 'S')
        .gte('DATA_EMISSAO', startDate)
        .lte('DATA_EMISSAO', `${endDate}T23:59:59`)
        .limit(100000); // Aumentar substancialmente o limite
      
      if (salesError) {
        console.error("Erro ao buscar dados de vendas:", salesError);
        return generateSampleStockData();
      }
      
      // Process the data to calculate analytics
      return processStockAndSalesData(combinedStockData, salesData || [], newProductDate, startDate, endDate);
      
    } catch (queryError) {
      console.error("Erro ao buscar dados diretos:", queryError);
      return generateSampleStockData();
    }
  } catch (error) {
    console.error("Erro ao buscar dados diretos:", error);
    return generateSampleStockData();
  }
};
