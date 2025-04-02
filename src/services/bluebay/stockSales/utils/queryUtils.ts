
import { supabase } from "@/integrations/supabase/client";
import { generateSampleStockData } from "../sampleDataGenerator";
import { handleApiError } from "../errorHandlingService";

/**
 * Fetch stock data with error handling
 */
export const fetchStockData = async () => {
  try {
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
      .limit(200000);
    
    if (stockError) {
      handleApiError("Erro ao buscar dados de estoque", stockError);
      throw new Error(`Erro ao buscar dados de estoque: ${stockError.message}`);
    }
    
    if (!stockData || stockData.length === 0) {
      console.warn("Nenhum dado de estoque encontrado");
      return [];
    }
    
    console.log(`Encontrados ${stockData.length} registros de estoque`);
    return stockData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de estoque", error);
    throw error;
  }
};

/**
 * Fetch item data in batches for given item codes
 */
export const fetchItemDataInBatches = async (itemCodes: string[]) => {
  try {
    const batchSize = 1000;
    let allItemData: any[] = [];
    
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
    
    return allItemData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de itens em lote", error);
    throw error;
  }
};

/**
 * Fetch sales data in batches for a specified date range
 */
export const fetchSalesDataInBatches = async (startDate: string, endDate: string) => {
  try {
    let allSalesData: any[] = [];
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
    return allSalesData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de vendas em lote", error);
    throw error;
  }
};

/**
 * Fetch stock items in paginated batches
 */
export const fetchStockItemsPaginated = async () => {
  try {
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
    
    return allStockItems;
  } catch (error) {
    handleApiError("Erro ao buscar itens de estoque paginados", error);
    throw error;
  }
};

/**
 * Fetch batch of item details by item codes
 */
export const fetchItemDetailsBatch = async (itemCodes: string[], batchSize: number = 500) => {
  try {
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
    
    return allItemDetails;
  } catch (error) {
    handleApiError("Erro ao buscar detalhes de itens em lote", error);
    throw error;
  }
};

/**
 * Fetch paginated sales data for a date range
 */
export const fetchSalesDataPaginated = async (startDate: string, endDate: string) => {
  try {
    let allSalesData: any[] = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 5000;
    
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
    
    return allSalesData;
  } catch (error) {
    handleApiError("Erro ao buscar dados de vendas paginados", error);
    throw error;
  }
};
