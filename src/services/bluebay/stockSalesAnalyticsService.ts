
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";

export interface StockItem {
  ITEM_CODIGO: string;
  DESCRICAO: string;
  GRU_DESCRICAO: string;
  DATACADASTRO: string | null;
  FISICO: number;
  DISPONIVEL: number;
  RESERVADO: number;
  ENTROU: number;
  LIMITE: number;
  QTD_VENDIDA: number;
  VALOR_TOTAL_VENDIDO: number;
  DATA_ULTIMA_VENDA: string | null;
  GIRO_ESTOQUE: number;
  PERCENTUAL_ESTOQUE_VENDIDO: number;
  DIAS_COBERTURA: number;
  PRODUTO_NOVO: boolean;
  RANKING: number | null;
}

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
    
    // Query using the custom function
    // Using a type cast to any to bypass TypeScript's RPC function name checking
    // since the function was just added and may not be in the TypeScript definitions yet
    const { data, error } = await supabase
      .rpc('get_stock_sales_analytics' as any, { 
        p_start_date: startDate,
        p_end_date: endDate,
        p_new_product_date: sixtyDaysAgo
      });

    if (error) {
      console.error("Erro ao buscar dados de análise de estoque e vendas:", error);
      throw error;
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.info("Nenhum dado de análise de estoque e vendas encontrado para o período");
      return [];
    }
    
    console.info(`Buscados ${data.length} registros de análise de estoque e vendas`);
    
    // Cast the data to StockItem[] after confirming it's an array
    return data as unknown as StockItem[];
  } catch (error) {
    console.error("Erro ao buscar dados de análise de estoque e vendas:", error);
    throw error;
  }
};

// Function to handle fallback with direct queries in case the RPC fails
export const fetchStockSalesAnalyticsWithDirectQueries = async (
  startDate: string,
  endDate: string
): Promise<StockItem[]> => {
  try {
    console.log("Usando consultas diretas para buscar dados de estoque e vendas");
    
    // Calculate the date 60 days ago for identifying new products
    const sixtyDaysAgo = format(subDays(new Date(), 60), 'yyyy-MM-dd');
    
    // First, get stock data joined with item data
    const { data: stockItems, error: stockError } = await supabase
      .from('BLUEBAY_ESTOQUE')
      .select(`
        ITEM_CODIGO,
        FISICO,
        DISPONIVEL,
        RESERVADO,
        ENTROU,
        LIMITE,
        BLUEBAY_ITEM:ITEM_CODIGO (
          DESCRICAO,
          GRU_DESCRICAO,
          DATACADASTRO
        )
      `)
      .eq('LOCAL', 1);
    
    if (stockError) {
      console.error("Erro ao buscar dados de estoque:", stockError);
      throw stockError;
    }
    
    if (!stockItems || stockItems.length === 0) {
      console.info("Nenhum dado de estoque encontrado");
      return [];
    }
    
    // Next, get sales data for the period
    const { data: salesData, error: salesError } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select(`
        ITEM_CODIGO,
        QUANTIDADE,
        VALOR_UNITARIO,
        DATA_EMISSAO
      `)
      .eq('TIPO', 'S')
      .gte('DATA_EMISSAO', startDate + 'T00:00:00Z')
      .lte('DATA_EMISSAO', endDate + 'T23:59:59Z');
    
    if (salesError) {
      console.error("Erro ao buscar dados de vendas:", salesError);
      throw salesError;
    }
    
    // Process and join the data
    const result = processStockAndSalesData(stockItems, salesData || [], sixtyDaysAgo, startDate, endDate);
    return result;
  } catch (error) {
    console.error("Erro ao buscar dados diretos:", error);
    throw error;
  }
};

// Helper function to process stock and sales data from direct queries
const processStockAndSalesData = (
  stockItems: any[], 
  salesData: any[], 
  newProductDate: string,
  startDate: string,
  endDate: string
): StockItem[] => {
  // Group sales data by item code
  const salesByItem = salesData.reduce((acc, sale) => {
    const itemCode = sale.ITEM_CODIGO;
    if (!acc[itemCode]) {
      acc[itemCode] = {
        QTD_VENDIDA: 0,
        VALOR_TOTAL_VENDIDO: 0,
        DATA_ULTIMA_VENDA: null,
        salesDates: []
      };
    }
    
    // Add sales quantity and value
    const quantidade = Number(sale.QUANTIDADE) || 0;
    const valorUnitario = Number(sale.VALOR_UNITARIO) || 0;
    
    acc[itemCode].QTD_VENDIDA += quantidade;
    acc[itemCode].VALOR_TOTAL_VENDIDO += quantidade * valorUnitario;
    
    // Track sales date for calculating the last sale date
    if (sale.DATA_EMISSAO) {
      const saleDate = new Date(sale.DATA_EMISSAO);
      acc[itemCode].salesDates.push(saleDate);
      
      // Update last sale date if this sale is more recent
      if (!acc[itemCode].DATA_ULTIMA_VENDA || saleDate > new Date(acc[itemCode].DATA_ULTIMA_VENDA)) {
        acc[itemCode].DATA_ULTIMA_VENDA = sale.DATA_EMISSAO;
      }
    }
    
    return acc;
  }, {});
  
  // Calculate date range for average daily sales
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const daysDiff = Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Process stock items with sales data
  const processedItems = stockItems.map(item => {
    const itemCode = item.ITEM_CODIGO;
    const fisico = Number(item.FISICO) || 0;
    const salesInfo = salesByItem[itemCode] || {
      QTD_VENDIDA: 0,
      VALOR_TOTAL_VENDIDO: 0,
      DATA_ULTIMA_VENDA: null
    };
    
    const qtdVendida = salesInfo.QTD_VENDIDA;
    const mediaVendasDiaria = qtdVendida / daysDiff;
    
    // Calculate indicators
    const giroEstoque = fisico > 0 ? qtdVendida / fisico : 0;
    const percentualEstoqueVendido = qtdVendida + fisico > 0 
      ? (qtdVendida / (qtdVendida + fisico)) * 100 
      : 0;
    const diasCobertura = mediaVendasDiaria > 0 
      ? fisico / mediaVendasDiaria 
      : fisico > 0 ? 999 : 0; // 999 days if there are no sales but stock exists, 0 if no stock
    
    const dataCadastro = item.BLUEBAY_ITEM?.DATACADASTRO;
    const produtoNovo = dataCadastro && new Date(dataCadastro) > new Date(newProductDate);
    
    return {
      ITEM_CODIGO: itemCode,
      DESCRICAO: item.BLUEBAY_ITEM?.DESCRICAO || '',
      GRU_DESCRICAO: item.BLUEBAY_ITEM?.GRU_DESCRICAO || '',
      DATACADASTRO: dataCadastro,
      FISICO: fisico,
      DISPONIVEL: Number(item.DISPONIVEL) || 0,
      RESERVADO: Number(item.RESERVADO) || 0,
      ENTROU: Number(item.ENTROU) || 0,
      LIMITE: Number(item.LIMITE) || 0,
      QTD_VENDIDA: qtdVendida,
      VALOR_TOTAL_VENDIDO: salesInfo.VALOR_TOTAL_VENDIDO,
      DATA_ULTIMA_VENDA: salesInfo.DATA_ULTIMA_VENDA,
      GIRO_ESTOQUE: giroEstoque,
      PERCENTUAL_ESTOQUE_VENDIDO: percentualEstoqueVendido,
      DIAS_COBERTURA: diasCobertura,
      PRODUTO_NOVO: !!produtoNovo,
      RANKING: null // Will be assigned later
    };
  });
  
  // Assign rankings
  return assignRankings(processedItems);
};

// Function to assign rankings based on quantity sold
const assignRankings = (items: StockItem[]): StockItem[] => {
  // Sort items by QTD_VENDIDA in descending order
  const sortedItems = [...items].sort((a, b) => b.QTD_VENDIDA - a.QTD_VENDIDA);
  
  // Assign rankings to items with sales > 0
  let currentRank = 1;
  let lastQtdVendida = -1;
  
  return sortedItems.map(item => {
    // Only assign ranking to items with sales
    if (item.QTD_VENDIDA > 0) {
      // If current item's sales differ from previous, increment rank
      if (item.QTD_VENDIDA !== lastQtdVendida) {
        currentRank = sortedItems.filter(i => i.QTD_VENDIDA > item.QTD_VENDIDA).length + 1;
        lastQtdVendida = item.QTD_VENDIDA;
      }
      
      return {
        ...item,
        RANKING: currentRank
      };
    }
    
    // Items with no sales get null ranking
    return {
      ...item,
      RANKING: null
    };
  }).sort((a, b) => (a.DESCRICAO || '').localeCompare(b.DESCRICAO || ''));
};
