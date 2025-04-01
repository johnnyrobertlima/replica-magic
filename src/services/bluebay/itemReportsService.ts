
import { supabase } from "@/integrations/supabase/client";
import { fetchBluebayFaturamento } from "./faturamentoService";
import { ItemReport } from "./types";

/**
 * Fetch unique item codes from faturamento data
 */
const getUniqueItemCodes = (faturamentoData: any[]): string[] => {
  try {
    return [...new Set(
      faturamentoData
        .filter(item => item.ITEM_CODIGO)
        .map(item => item.ITEM_CODIGO)
    )];
  } catch (error) {
    console.error("Error extracting unique item codes:", error);
    return [];
  }
};

/**
 * Fetch item information from database
 */
const fetchItemsInformation = async (itemCodes: string[]) => {
  if (!itemCodes.length) return [];

  try {
    console.log(`Fetching information for ${itemCodes.length} unique item codes`);
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('BLUEBAY_ITEM')
      .select('*')
      .in('ITEM_CODIGO', itemCodes);
    
    if (itemsError) {
      console.error("Error fetching item information:", itemsError);
      throw itemsError;
    }
    
    console.log(`Loaded information for ${itemsData?.length || 0} items`);
    return itemsData || [];
  } catch (error) {
    console.error("Error in fetchItemsInformation:", error);
    return [];
  }
};

/**
 * Create a map of item codes to their information
 */
const createItemInfoMap = (itemsData: any[]) => {
  const itemsMap = new Map();
  
  itemsData.forEach(item => {
    itemsMap.set(item.ITEM_CODIGO, {
      DESCRICAO: item.DESCRICAO,
      GRU_DESCRICAO: item.GRU_DESCRICAO
    });
  });
  
  return itemsMap;
};

/**
 * Process faturamento data into item reports
 */
const processItemReports = (faturamentoData: any[], itemsMap: Map<string, any>): ItemReport[] => {
  try {
    const itemReports: { [key: string]: ItemReport } = {};
    
    faturamentoData.forEach(fatura => {
      if (!fatura.ITEM_CODIGO) return;
      
      const itemCode = fatura.ITEM_CODIGO;
      const quantidade = fatura.QUANTIDADE || 0;
      const valorTotal = fatura.VALOR_UNITARIO ? quantidade * fatura.VALOR_UNITARIO : 0;
      
      if (!itemReports[itemCode]) {
        const itemInfo = itemsMap.get(itemCode) || {};
        itemReports[itemCode] = {
          ITEM_CODIGO: itemCode,
          DESCRICAO: itemInfo.DESCRICAO || '',
          GRU_DESCRICAO: itemInfo.GRU_DESCRICAO || '',
          TOTAL_QUANTIDADE: 0,
          TOTAL_VALOR: 0,
          OCORRENCIAS: 0
        };
      }
      
      itemReports[itemCode].TOTAL_QUANTIDADE += quantidade;
      itemReports[itemCode].TOTAL_VALOR += valorTotal;
      itemReports[itemCode].OCORRENCIAS += 1;
    });
    
    return Object.values(itemReports);
  } catch (error) {
    console.error("Error processing item reports:", error);
    return [];
  }
};

/**
 * Generate test data for development and testing purposes
 */
const generateTestData = (): ItemReport[] => {
  console.log("Using test data for development");
  return [
    {
      ITEM_CODIGO: "TEST001",
      DESCRICAO: "Test Item 1",
      GRU_DESCRICAO: "Test Group",
      TOTAL_QUANTIDADE: 100,
      TOTAL_VALOR: 5000,
      OCORRENCIAS: 5
    },
    {
      ITEM_CODIGO: "TEST002",
      DESCRICAO: "Test Item 2",
      GRU_DESCRICAO: "Test Group",
      TOTAL_QUANTIDADE: 200,
      TOTAL_VALOR: 8000,
      OCORRENCIAS: 8
    },
    {
      ITEM_CODIGO: "TEST003",
      DESCRICAO: "Test Item 3",
      GRU_DESCRICAO: "Another Group",
      TOTAL_QUANTIDADE: 50,
      TOTAL_VALOR: 2500,
      OCORRENCIAS: 3
    }
  ];
};

/**
 * Main function to fetch Bluebay items report
 */
export const fetchBluebayItemsReport = async (
  startDate: string,
  endDate: string
): Promise<ItemReport[]> => {
  try {
    console.log("Buscando relatório de itens Bluebay...", {
      startDate,
      endDate
    });
    
    // Fetch faturamento data with date filter - only from BLUEBAY
    const faturamentoData = await fetchBluebayFaturamento(startDate, endDate);
    
    if (!Array.isArray(faturamentoData) || faturamentoData.length === 0) {
      console.info("Nenhum dado de faturamento encontrado para o período");
      
      // Buscar alguns dados da tabela de faturamento diretamente para diagnóstico
      const { data: sampleData, error: sampleError } = await supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('DATA_EMISSAO, PED_NUMPEDIDO, ITEM_CODIGO')
        .order('DATA_EMISSAO', { ascending: false })
        .limit(5);
      
      if (sampleError) {
        console.error("Erro ao buscar amostra de dados:", sampleError);
      } else if (sampleData && sampleData.length > 0) {
        console.log("Amostra de dados recentes de faturamento:", sampleData);
        
        // Verificar se há dados no período especificado
        try {
          const countResult = await supabase
            .from('BLUEBAY_FATURAMENTO')
            .select('*', { count: 'exact', head: true })
            .gte('DATA_EMISSAO', startDate)
            .lte('DATA_EMISSAO', endDate + 'T23:59:59');
          
          if (countResult.error) {
            console.error("Erro ao verificar dados no período:", countResult.error);
          } else {
            const count = countResult.count !== null ? countResult.count : 0;
            console.log(`Quantidade de registros no período ${startDate} a ${endDate}: ${count}`);
          }
        } catch (countError) {
          console.error("Erro na consulta de contagem:", countError);
        }
      }
      
      // Use test data ONLY in development mode for demonstration
      const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      
      if (isDevelopment) {
        console.log("Usando dados de teste temporários para demonstração");
        return generateTestData();
      }
      
      return [];
    }
    
    console.log(`Processing ${faturamentoData.length} faturamento records`);
    
    // Get unique item codes from faturamento
    const itemCodes = getUniqueItemCodes(faturamentoData);
    
    if (itemCodes.length === 0) {
      console.info("No items found in faturamento data");
      return [];
    }
    
    console.log(`Found ${itemCodes.length} unique item codes`);
    
    // Fetch item information
    const itemsData = await fetchItemsInformation(itemCodes);
    
    // Create map of item information 
    const itemsMap = createItemInfoMap(itemsData);
    
    // Process faturamento data into item reports
    const result = processItemReports(faturamentoData, itemsMap);
    
    console.log(`Generated report with ${result.length} items`);
    return result;
  } catch (error) {
    console.error("Error fetching item reports:", error);
    
    // In development, return test data if there's an error
    const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    if (isDevelopment) {
      console.log("Using test data due to error");
      return generateTestData();
    }
    
    throw error;
  }
};
