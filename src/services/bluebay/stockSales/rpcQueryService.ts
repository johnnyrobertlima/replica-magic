
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "./errorHandlingService";
import { StockItem } from "./types";
import { format, subDays } from "date-fns";

/**
 * Main function to fetch data via RPC (database function)
 */
export const fetchStockSalesViaRpc = async (
  startDate: string,
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Tentando buscar dados via RPC...");
    // Calculate the date 60 days ago for identifying new products
    const newProductDate = format(subDays(new Date(), 60), 'yyyy-MM-dd');
    
    // Attempt to use the paginated RPC function (preferred method)
    console.log("Tentando buscar dados via RPC com paginação");
    const paginatedData = await fetchPaginatedRpcData(startDate, endDate, newProductDate);
    
    if (paginatedData.length > 0) {
      // Add calculated fields for purchase costs and profits
      const enhancedData = await enhanceWithPurchaseData(paginatedData, startDate, endDate);
      return enhancedData;
    }
    
    // If paginated method fails, try the direct RPC call
    console.log("Tentando buscar dados via RPC sem paginação");
    const { data, error } = await supabase.rpc(
      'get_stock_sales_analytics',
      { 
        p_start_date: startDate,
        p_end_date: endDate,
        p_new_product_date: newProductDate
      }
    );

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error("RPC returned no data");
    }

    console.log(`RPC retornou ${data.length} registros`);
    
    // Add calculated fields for purchase costs and profits
    const enhancedData = await enhanceWithPurchaseData(data, startDate, endDate);
    return enhancedData;
  } catch (error) {
    handleApiError("Erro ao buscar dados via RPC", error);
    throw error;
  }
};

/**
 * Add purchase cost and profit data to the stock items
 */
async function enhanceWithPurchaseData(stockItems: any[], startDate: string, endDate: string): Promise<StockItem[]> {
  try {
    // Fetch purchase data (TIPO = E, TRANSACAO = 200)
    const { data: purchaseData, error } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .eq('TIPO', 'E')
      .eq('TRANSACAO', 200)
      .gte('DATA_EMISSAO', startDate)
      .lte('DATA_EMISSAO', `${endDate} 23:59:59`);
      
    if (error) {
      console.error("Erro ao buscar dados de compra:", error);
      // If we can't get purchase data, provide default values
      return stockItems.map(item => ({
        ...item,
        CUSTO_MEDIO: 0,
        LUCRO: 0
      }));
    }
    
    // Group purchase data by item code
    const purchaseByItem = (purchaseData || []).reduce((acc, purchase) => {
      const itemCode = purchase.ITEM_CODIGO;
      if (!itemCode) return acc;
      
      if (!acc[itemCode]) {
        acc[itemCode] = {
          TOTAL_QTD_COMPRADA: 0,
          TOTAL_VALOR_COMPRA: 0
        };
      }
      
      const quantidade = Number(purchase.QUANTIDADE) || 0;
      const valorUnitario = Number(purchase.VALOR_UNITARIO) || 0;
      
      acc[itemCode].TOTAL_QTD_COMPRADA += quantidade;
      acc[itemCode].TOTAL_VALOR_COMPRA += quantidade * valorUnitario;
      
      return acc;
    }, {});
    
    // Add cost and profit data to each item
    return stockItems.map(item => {
      const itemCode = item.ITEM_CODIGO;
      const purchaseInfo = purchaseByItem[itemCode] || { TOTAL_QTD_COMPRADA: 0, TOTAL_VALOR_COMPRA: 0 };
      
      // Calculate average purchase cost
      const custoMedio = purchaseInfo.TOTAL_QTD_COMPRADA > 0 
        ? purchaseInfo.TOTAL_VALOR_COMPRA / purchaseInfo.TOTAL_QTD_COMPRADA
        : 0;
        
      // Calculate profit
      const qtdVendida = Number(item.QTD_VENDIDA) || 0;
      const valorVendido = Number(item.VALOR_TOTAL_VENDIDO) || 0;
      const custoTotal = custoMedio * qtdVendida;
      const lucro = valorVendido - custoTotal;
      
      // Add the new fields to the item
      return {
        ...item,
        PRECO_MEDIO: item.PRECO_MEDIO || (qtdVendida > 0 ? valorVendido / qtdVendida : 0),
        CUSTO_MEDIO: custoMedio,
        LUCRO: lucro
      };
    });
  } catch (error) {
    console.error("Erro ao calcular dados de custo e lucro:", error);
    // If there's an error, return items with default values
    return stockItems.map(item => ({
      ...item,
      PRECO_MEDIO: item.PRECO_MEDIO || 0,
      CUSTO_MEDIO: 0,
      LUCRO: 0
    }));
  }
}

/**
 * Fetch data using the paginated RPC function
 */
async function fetchPaginatedRpcData(startDate: string, endDate: string, newProductDate: string): Promise<StockItem[]> {
  try {
    const pageSize = 1000;
    let page = 0;
    let allData: any[] = [];
    let hasMore = true;
    
    while (hasMore) {
      console.log(`Buscando página ${page + 1} via RPC...`);
      
      const { data, error } = await supabase.rpc(
        'get_stock_sales_analytics',
        { 
          p_start_date: startDate,
          p_end_date: endDate,
          p_new_product_date: newProductDate,
          p_limit: pageSize,
          p_offset: page * pageSize
        }
      );
      
      if (error) {
        console.error(`Erro na página ${page + 1}:`, error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        console.info(`Recebidos ${data.length} registros na página ${page + 1} via RPC`);
        allData = [...allData, ...data];
        
        // Check if we received a full page
        if (data.length < pageSize) {
          hasMore = false;
        }
        
        page++;
      }
    }
    
    console.info(`Total de ${allData.length} registros obtidos via RPC em ${page} páginas`);
    return allData;
    
  } catch (error) {
    handleApiError("Erro ao buscar dados via RPC com paginação", error);
    throw error;
  }
}
