
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { StockItem } from "./types";

/**
 * Fetches stock sales analytics data using the RPC function
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
    
    // Query using the custom function without limits
    const { data, error } = await supabase
      .rpc('get_stock_sales_analytics', { 
        p_start_date: startDate,
        p_end_date: endDate,
        p_new_product_date: sixtyDaysAgo
      })
      .select('*');
    
    if (error) {
      console.error("Erro na função RPC:", error.message, error.details);
      throw error;
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
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
      RANKING: item.ranking // No conversion needed now
    }));
    
    return transformedData;
  } catch (error) {
    console.error("Erro ao carregar dados de estoque-vendas:", error);
    throw error; // Re-throw to let the UI handle displaying the error
  }
};

// Re-export required types from the types file
export type { StockItem } from "./types";
