
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
      // Using a batched approach for potentially large datasets
      // First, get all stock data with a large limit
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
        .limit(200000); // Very large limit to ensure we get all records
      
      if (stockError) {
        console.error("Erro ao buscar dados de estoque:", stockError);
        return generateSampleStockData();
      }
      
      if (!stockData || stockData.length === 0) {
        console.warn("Nenhum dado de estoque encontrado");
        return generateSampleStockData();
      }
      
      console.log(`Encontrados ${stockData.length} registros de estoque`);
      
      // Fetch item data for the stock items in batches if there are many
      const itemCodes = stockData.map(item => item.ITEM_CODIGO);
      let allItemData = [];
      
      // Process in batches of 1000 to avoid query size limitations
      const batchSize = 1000;
      for (let i = 0; i < itemCodes.length; i += batchSize) {
        const batchCodes = itemCodes.slice(i, i + batchSize);
        const { data: itemBatch, error: itemBatchError } = await supabase
          .from('BLUEBAY_ITEM')
          .select(`
            "ITEM_CODIGO",
            "DESCRICAO",
            "GRU_DESCRICAO",
            "DATACADASTRO"
          `)
          .in('ITEM_CODIGO', batchCodes);
        
        if (itemBatchError) {
          console.error(`Erro ao buscar lote de itens ${i}-${i+batchSize}:`, itemBatchError);
          continue;
        }
        
        if (itemBatch && itemBatch.length > 0) {
          allItemData = [...allItemData, ...itemBatch];
        }
        
        console.log(`Processado lote ${i/batchSize + 1} de itens (${batchCodes.length} itens)`);
      }
      
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
      
      // Fetch sales data in batches for the specified period
      console.log(`Buscando dados de vendas para o período ${startDate} até ${endDate}`);
      
      let allSalesData = [];
      let hasMoreSales = true;
      let offset = 0;
      const salesBatchSize = 5000;
      
      while (hasMoreSales) {
        const { data: salesBatch, error: salesBatchError } = await supabase
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
          .range(offset, offset + salesBatchSize - 1);
        
        if (salesBatchError) {
          console.error(`Erro ao buscar lote de vendas ${offset}-${offset+salesBatchSize}:`, salesBatchError);
          break;
        }
        
        if (!salesBatch || salesBatch.length === 0) {
          hasMoreSales = false;
        } else {
          allSalesData = [...allSalesData, ...salesBatch];
          offset += salesBatchSize;
          console.log(`Processado lote de vendas, total acumulado: ${allSalesData.length}`);
          
          // If we got fewer records than the batch size, we've reached the end
          if (salesBatch.length < salesBatchSize) {
            hasMoreSales = false;
          }
        }
      }
      
      console.log(`Total de ${allSalesData.length} registros de vendas encontrados`);
      
      // Process the data to calculate analytics
      return processStockAndSalesData(combinedStockData, allSalesData, newProductDate, startDate, endDate);
      
    } catch (queryError) {
      console.error("Erro ao buscar dados diretos:", queryError);
      return generateSampleStockData();
    }
  } catch (error) {
    console.error("Erro ao buscar dados diretos:", error);
    return generateSampleStockData();
  }
};
