
import { StockItem } from "./types";

/**
 * Process stock and sales data from direct queries
 */
export const processStockAndSalesData = (
  stockItems: any[], 
  salesData: any[],
  costData: any[],
  newProductDate: string,
  startDate: string,
  endDate: string
): StockItem[] => {
  // Group sales data by item code
  const salesByItem = salesData.reduce((acc, sale) => {
    const itemCode = sale["ITEM_CODIGO"];
    if (!itemCode) return acc;
    
    if (!acc[itemCode]) {
      acc[itemCode] = {
        QTD_VENDIDA: 0,
        VALOR_TOTAL_VENDIDO: 0,
        DATA_ULTIMA_VENDA: null,
        salesDates: [],
        // Arrays para armazenar quantidades e valores para cálculo da média ponderada
        quantidades: [],
        valores: []
      };
    }
    
    // Add sales quantity and value
    const quantidade = Number(sale["QUANTIDADE"]) || 0;
    const valorUnitario = Number(sale["VALOR_UNITARIO"]) || 0;
    
    acc[itemCode].QTD_VENDIDA += quantidade;
    acc[itemCode].VALOR_TOTAL_VENDIDO += quantidade * valorUnitario;
    
    // Armazena os valores para cálculo da média ponderada
    if (quantidade > 0 && valorUnitario > 0) {
      acc[itemCode].quantidades.push(quantidade);
      acc[itemCode].valores.push(valorUnitario);
    }
    
    // Track sales date for calculating the last sale date
    if (sale["DATA_EMISSAO"]) {
      const saleDate = new Date(sale["DATA_EMISSAO"]);
      acc[itemCode].salesDates.push(saleDate);
      
      // Update last sale date if this sale is more recent
      if (!acc[itemCode].DATA_ULTIMA_VENDA || saleDate > new Date(acc[itemCode].DATA_ULTIMA_VENDA)) {
        acc[itemCode].DATA_ULTIMA_VENDA = sale["DATA_EMISSAO"];
      }
    }
    
    return acc;
  }, {});

  // Create a map of cost data by item code
  const costByItem = new Map();
  costData.forEach(item => {
    costByItem.set(item.ITEM_CODIGO, {
      CUSTO_MEDIO: Number(item.media_valor_unitario) || 0,
      ENTROU: Number(item.total_quantidade) || 0
    });
  });
  
  // Calculate date range for average daily sales
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  const daysDiff = Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Track processed item codes to avoid duplicates
  const processedItemCodes = new Set<string>();
  
  // Fetch all item details to get a map of item code to item details
  const itemDetailsMap = stockItems.reduce((map, item) => {
    const itemCode = item["ITEM_CODIGO"];
    if (!map.has(itemCode)) {
      map.set(itemCode, {
        DESCRICAO: item["DESCRICAO"] || "",
        GRU_DESCRICAO: item["GRU_DESCRICAO"] || "",
        DATACADASTRO: item["DATACADASTRO"] || null
      });
    }
    return map;
  }, new Map());
  
  // Process stock items with sales data
  const processedItems = stockItems.reduce((acc, item) => {
    const itemCode = item["ITEM_CODIGO"];
    
    // Skip duplicate items
    if (processedItemCodes.has(itemCode)) {
      return acc;
    }
    
    processedItemCodes.add(itemCode);
    
    const fisico = Number(item["FISICO"]) || 0;
    const salesInfo = salesByItem[itemCode] || {
      QTD_VENDIDA: 0,
      VALOR_TOTAL_VENDIDO: 0,
      DATA_ULTIMA_VENDA: null,
      quantidades: [],
      valores: []
    };
    
    // Obter dados de custo da view
    const costInfo = costByItem.get(itemCode) || { CUSTO_MEDIO: 0, ENTROU: 0 };
    
    const qtdVendida = salesInfo.QTD_VENDIDA;
    const mediaVendasDiaria = qtdVendida / daysDiff;
    
    // Calcular preço médio ponderado
    let precoMedio = 0;
    if (qtdVendida > 0 && salesInfo.VALOR_TOTAL_VENDIDO > 0) {
      precoMedio = salesInfo.VALOR_TOTAL_VENDIDO / qtdVendida;
    }
    
    // Calculate indicators
    const giroEstoque = fisico > 0 ? qtdVendida / fisico : 0;
    const percentualEstoqueVendido = (qtdVendida + fisico) > 0 
      ? (qtdVendida / (qtdVendida + fisico)) * 100 
      : 0;
    const diasCobertura = mediaVendasDiaria > 0 
      ? fisico / mediaVendasDiaria 
      : fisico > 0 ? 999 : 0; // 999 days if there are no sales but stock exists, 0 if no stock
    
    // Get item details (description, group, cadastro date)
    const itemDetail = itemDetailsMap.get(itemCode) || {};
    const dataCadastro = itemDetail["DATACADASTRO"] || item["DATACADASTRO"];
    const produtoNovo = dataCadastro && new Date(dataCadastro) > new Date(newProductDate);
    
    acc.push({
      ITEM_CODIGO: itemCode,
      DESCRICAO: itemDetail["DESCRICAO"] || item["DESCRICAO"] || '',
      GRU_DESCRICAO: itemDetail["GRU_DESCRICAO"] || item["GRU_DESCRICAO"] || '',
      DATACADASTRO: dataCadastro,
      FISICO: fisico,
      DISPONIVEL: Number(item["DISPONIVEL"]) || 0,
      RESERVADO: Number(item["RESERVADO"]) || 0,
      ENTROU: costInfo.ENTROU, // Valor da view bluebay_view_faturamento_resumo
      LIMITE: Number(item["LIMITE"]) || 0,
      QTD_VENDIDA: qtdVendida,
      VALOR_TOTAL_VENDIDO: salesInfo.VALOR_TOTAL_VENDIDO,
      PRECO_MEDIO: precoMedio,
      CUSTO_MEDIO: costInfo.CUSTO_MEDIO, // Valor da view bluebay_view_faturamento_resumo
      DATA_ULTIMA_VENDA: salesInfo.DATA_ULTIMA_VENDA,
      GIRO_ESTOQUE: giroEstoque,
      PERCENTUAL_ESTOQUE_VENDIDO: percentualEstoqueVendido,
      DIAS_COBERTURA: diasCobertura,
      PRODUTO_NOVO: !!produtoNovo,
      RANKING: null // Will be assigned later
    });
    
    return acc;
  }, [] as StockItem[]);
  
  // Assign rankings
  return assignRankings(processedItems);
};

/**
 * Assign rankings based on quantity sold
 */
export const assignRankings = (items: StockItem[]): StockItem[] => {
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
  });
};
