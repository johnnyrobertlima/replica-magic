
import { supabase } from "@/integrations/supabase/client";
import { StockItem } from "./types";
import { format, subDays } from "date-fns";
import { fallbackToDirectQueries } from "./directQueriesService";
import { handleApiError, logDataValidationError } from "./errorHandlingService";

/**
 * Fetches stock sales analytics data using the RPC function
 */
export const fetchStockSalesViaRpc = async (
  startDate: string,
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Buscando dados via RPC para análise:", {
      startDate,
      endDate
    });

    // Calculate the date 60 days ago for identifying new products
    const sixtyDaysAgo = calculateNewProductCutoffDate();
    
    // Execute RPC query with head:false e count:exact para garantir que todos registros sejam retornados
    const result = await executeRpcQuery(startDate, endDate, sixtyDaysAgo);
    
    if (result.error) {
      throw new Error(`RPC Error: ${result.error.message}`);
    }

    const data = result.data || [];
    console.log(`Recebidos ${data.length} registros via RPC`);
    
    return processRpcResult(data);
  } catch (error) {
    handleApiError("Erro ao carregar dados via RPC", error);
    return fallbackToDirectQueries(startDate, endDate);
  }
};

/**
 * Calculates the cutoff date for identifying new products
 */
const calculateNewProductCutoffDate = (): string => {
  return format(subDays(new Date(), 60), 'yyyy-MM-dd');
};

/**
 * Executes the RPC query
 */
const executeRpcQuery = async (
  startDate: string, 
  endDate: string, 
  newProductDate: string
) => {
  return await supabase
    .rpc('get_stock_sales_analytics', { 
      p_start_date: startDate,
      p_end_date: endDate,
      p_new_product_date: newProductDate
    }, {
      head: false,
      count: 'exact'
    });
};

/**
 * Processes and validates the RPC query result
 */
const processRpcResult = (data: any): StockItem[] => {
  if (!data || !Array.isArray(data)) {
    logDataValidationError(data, "Dados retornados não são um array");
    throw new Error("Dados retornados não são um array");
  }
  
  if (data.length === 0) {
    console.info("Nenhum dado de análise de estoque e vendas encontrado para o período");
    return [];
  }
  
  console.info(`Processando ${data.length} registros de análise de estoque e vendas`);
  
  // Transform the data from lowercase properties to uppercase to match our StockItem type
  return transformDataToStockItems(data);
};

/**
 * Transforms raw data into StockItem objects
 */
const transformDataToStockItems = (data: any[]): StockItem[] => {
  // We're no longer skipping items with the same ITEM_CODIGO
  // Just transform each item directly without filtering duplicates
  return data.map(item => ({
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
};
