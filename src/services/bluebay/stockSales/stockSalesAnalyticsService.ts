
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { StockItem } from "./types";
import { generateSampleStockData } from "./sampleDataGenerator";
import { processStockAndSalesData } from "./dataProcessingUtils";

/**
 * Fetches stock sales analytics data using the RPC function with pagination
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
      // Query using the custom function
      const { data, error } = await supabase
        .rpc('get_stock_sales_analytics', { 
          p_start_date: startDate,
          p_end_date: endDate,
          p_new_product_date: sixtyDaysAgo
        });
      
      if (error) {
        console.error("Erro na função RPC:", error.message, error.details);
        console.log("Tentando método alternativo com consultas diretas...");
        return fallbackToDirectQueries(startDate, endDate);
      }

      if (!data || !Array.isArray(data)) {
        console.info("Dados retornados não são um array. Tentando método alternativo...");
        return fallbackToDirectQueries(startDate, endDate);
      }
      
      if (data.length === 0) {
        console.info("Nenhum dado de análise de estoque e vendas encontrado para o período");
        return [];
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
    } catch (error) {
      console.error("Erro ao carregar dados via RPC:", error);
      console.log("Tentando método alternativo com consultas diretas...");
      return fallbackToDirectQueries(startDate, endDate);
    }
  } catch (error) {
    console.error("Erro ao carregar dados de estoque-vendas:", error);
    return generateSampleStockData(); // Last resort - generate sample data
  }
};

/**
 * Fallback method that fetches data directly from tables when RPC fails
 */
const fallbackToDirectQueries = async (
  startDate: string,
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Executando método alternativo com consultas diretas");
    
    // Calculate the date 60 days ago for identifying new products
    const sixtyDaysAgo = format(subDays(new Date(), 60), 'yyyy-MM-dd');
    
    // First, get all estoque items (paginated)
    let allStockItems: any[] = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 5000;
    
    while (hasMore) {
      console.log(`Buscando página ${page} de estoque (tamanho: ${pageSize})`);
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      const { data: stockData, error: stockError, count } = await supabase
        .from("BLUEBAY_ESTOQUE")
        .select("*", { count: "exact" })
        .eq("LOCAL", 1)
        .range(from, to);
      
      if (stockError) {
        console.error(`Erro ao buscar página ${page} de estoque:`, stockError);
        hasMore = false;
        continue;
      }
      
      if (!stockData || stockData.length === 0) {
        hasMore = false;
      } else {
        allStockItems = [...allStockItems, ...stockData];
        page++;
        
        // Check if we've reached the end
        hasMore = count ? from + stockData.length < count : false;
        console.log(`Carregados ${allStockItems.length} itens de estoque. Total: ${count}`);
      }
    }
    
    if (allStockItems.length === 0) {
      console.warn("Nenhum item de estoque encontrado");
      return generateSampleStockData();
    }
    
    // Extract item codes to fetch item details
    const itemCodes = [...new Set(allStockItems.map(item => item.ITEM_CODIGO))];
    console.log(`Buscando detalhes para ${itemCodes.length} códigos de itens`);
    
    // Fetch item details in batches
    const batchSize = 500; // Adjust based on DB limitations
    let allItemDetails: any[] = [];
    
    for (let i = 0; i < itemCodes.length; i += batchSize) {
      const batchCodes = itemCodes.slice(i, i + batchSize);
      console.log(`Processando lote ${Math.floor(i/batchSize) + 1} de ${Math.ceil(itemCodes.length/batchSize)} (${batchCodes.length} itens)`);
      
      const { data: itemDetails, error: detailsError } = await supabase
        .from("BLUEBAY_ITEM")
        .select("*")
        .in("ITEM_CODIGO", batchCodes);
      
      if (detailsError) {
        console.error(`Erro ao buscar detalhes do lote de itens:`, detailsError);
        continue;
      }
      
      if (itemDetails && itemDetails.length > 0) {
        allItemDetails = [...allItemDetails, ...itemDetails];
      }
    }
    
    console.log(`Obtidos detalhes para ${allItemDetails.length} itens`);
    
    // Create a map for item details lookup
    const itemDetailsMap = new Map();
    allItemDetails.forEach(item => {
      itemDetailsMap.set(item.ITEM_CODIGO, item);
    });
    
    // Fetch sales data for the period in batches
    let allSalesData: any[] = [];
    hasMore = true;
    page = 0;
    
    while (hasMore) {
      console.log(`Buscando página ${page} de vendas para o período ${startDate} a ${endDate}`);
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      const { data: salesData, error: salesError, count } = await supabase
        .from("BLUEBAY_FATURAMENTO")
        .select("*", { count: "exact" })
        .eq("TIPO", "S")
        .gte("DATA_EMISSAO", startDate)
        .lte("DATA_EMISSAO", `${endDate}T23:59:59`)
        .range(from, to);
      
      if (salesError) {
        console.error(`Erro ao buscar página ${page} de vendas:`, salesError);
        hasMore = false;
        continue;
      }
      
      if (!salesData || salesData.length === 0) {
        hasMore = false;
      } else {
        allSalesData = [...allSalesData, ...salesData];
        page++;
        
        // Check if we've reached the end
        hasMore = count ? from + salesData.length < count : false;
        console.log(`Carregados ${allSalesData.length} registros de vendas. Total: ${count}`);
      }
    }
    
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
    console.error("Falha nas consultas diretas:", error);
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
