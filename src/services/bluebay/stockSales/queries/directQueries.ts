
import { format, subDays } from "date-fns";
import { StockItem } from "../types";
import { generateSampleStockData } from "../sampleDataGenerator";
import { handleApiError } from "../errorHandlingService";
import { processStockAndSalesData } from "../dataProcessing";
import {
  fetchStockData,
  fetchItemDataInBatches,
  fetchSalesDataInBatches,
  fetchPurchaseDataInBatches
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
    const sixtyDaysAgo = format(subDays(new Date(), 60), 'yyyy-MM-dd');
    
    try {
      console.log("Iniciando consulta de dados com sistema de batching melhorado");
      
      // First, get all stock data using the improved batching system
      console.log("Etapa 1: Buscando dados de estoque");
      const stockData = await fetchStockData();
      
      if (stockData.length === 0) {
        console.warn("Nenhum dado de estoque encontrado, retornando dados de exemplo");
        return generateSampleStockData();
      }
      
      console.log(`Encontrados ${stockData.length} registros de estoque`);
      
      // Extract item codes for item data lookup
      console.log("Etapa 2: Extraindo códigos de itens para busca de detalhes");
      const itemCodes = stockData.map(item => item.ITEM_CODIGO);
      // Remover códigos duplicados
      const uniqueItemCodes = [...new Set(itemCodes)];
      console.log(`Extraídos ${uniqueItemCodes.length} códigos únicos de itens de ${itemCodes.length} registros`);
      
      // Fetch item data for the stock items in batches
      console.log("Etapa 3: Buscando detalhes dos itens em lotes");
      const allItemData = await fetchItemDataInBatches(uniqueItemCodes);
      
      if (allItemData.length === 0) {
        console.error("Não foi possível obter dados dos itens");
        return generateSampleStockData();
      }
      
      console.log(`Obtidos dados para ${allItemData.length} itens de ${uniqueItemCodes.length} códigos`);
      
      // Create a map of item data for easy lookup
      console.log("Etapa 4: Criando mapa de itens para lookup rápido");
      const itemMap = new Map();
      allItemData.forEach(item => {
        itemMap.set(item.ITEM_CODIGO, item);
      });
      
      // Combine stock data with item data
      console.log("Etapa 5: Combinando dados de estoque com detalhes dos itens");
      const combinedStockData = stockData.map(stockItem => {
        const item = itemMap.get(stockItem.ITEM_CODIGO);
        return {
          ...stockItem,
          BLUEBAY_ITEM: item || {
            DESCRICAO: 'Item não encontrado',
            GRU_DESCRICAO: 'Grupo não encontrado',
            DATACADASTRO: null
          }
        };
      });
      
      // Fetch sales data for the specified period
      console.log(`Etapa 6: Buscando dados de vendas para o período ${startDate} até ${endDate}`);
      const allSalesData = await fetchSalesDataInBatches(startDate, endDate);
      console.log(`Obtidos ${allSalesData.length} registros de vendas`);

      // Fetch purchase data for calculating cost
      console.log(`Etapa 7: Buscando dados de compras para o período ${startDate} até ${endDate}`);
      const allPurchaseData = await fetchPurchaseDataInBatches(startDate, endDate);
      console.log(`Obtidos ${allPurchaseData.length} registros de compras`);
      
      // Process the data to calculate analytics
      console.log("Etapa 8: Processando dados para cálculo de indicadores");
      const processedData = processStockAndSalesData(
        combinedStockData, 
        allSalesData,
        allPurchaseData,
        sixtyDaysAgo, 
        startDate, 
        endDate
      );
      
      console.log(`Processamento concluído: ${processedData.length} itens com indicadores calculados`);
      return processedData;
      
    } catch (queryError) {
      console.error("Erro durante a consulta direta de dados:", queryError);
      handleApiError("Erro ao buscar dados diretos", queryError);
      return generateSampleStockData();
    }
  } catch (error) {
    handleApiError("Erro ao buscar dados diretos", error);
    return generateSampleStockData();
  }
};
