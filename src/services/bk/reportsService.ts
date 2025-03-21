
import { supabase } from "@/integrations/supabase/client";
import { 
  fetchBkFaturamentoData,
  BkFaturamento
} from "@/services/bk/financialService";

/**
 * Interface for item reports
 */
export interface ItemReport {
  ITEM_CODIGO: string;
  DESCRICAO?: string;
  GRU_DESCRICAO?: string; // Added group description
  TOTAL_QUANTIDADE: number;
  TOTAL_VALOR: number;
  OCORRENCIAS: number;
}

/**
 * Interface for item details
 */
export interface ItemDetail {
  NOTA: string;
  DATA_EMISSAO: string;
  CLIENTE_NOME: string;
  PES_CODIGO: number;
  QUANTIDADE: number;
  VALOR_UNITARIO: number;
  FATOR_CORRECAO?: number | null;
}

/**
 * Fetches and processes items report data
 */
export const fetchBkItemsReport = async (
  startDate?: string,
  endDate?: string
): Promise<ItemReport[]> => {
  console.log("Fetching B&K items report data...", { startDate, endDate });
  
  // Reuse the same data fetching logic from financial service
  const faturamentoData = await fetchBkFaturamentoData(startDate, endDate);
  
  // Get unique item codes from the faturamento data
  const itemCodes = [...new Set(faturamentoData
    .filter(item => item.ITEM_CODIGO)
    .map(item => item.ITEM_CODIGO as string))];
  
  // Fetch item descriptions and group information from BLUEBAY_ITEM table
  const { data: itemData, error: itemError } = await supabase
    .from('BLUEBAY_ITEM')
    .select('ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO')
    .in('ITEM_CODIGO', itemCodes);
  
  if (itemError) {
    console.error("Error fetching item descriptions:", itemError);
  }
  
  // Create a map of item codes to descriptions and groups
  const itemInfoMap = new Map<string, { descricao: string, grupoDescricao: string }>();
  if (itemData) {
    itemData.forEach(item => {
      if (item.ITEM_CODIGO) {
        itemInfoMap.set(item.ITEM_CODIGO, {
          descricao: item.DESCRICAO || '',
          grupoDescricao: item.GRU_DESCRICAO || 'Sem Grupo'
        });
      }
    });
  }
  
  // Process the faturamento data with the item descriptions from our map
  return processItemsReport(faturamentoData, itemInfoMap);
};

/**
 * Fetches details for a specific item
 */
export const fetchItemDetails = async (
  itemCode: string,
  startDate?: string,
  endDate?: string
): Promise<ItemDetail[]> => {
  console.log(`Fetching details for item ${itemCode}...`);
  
  // Reuse the same data fetching logic from financial service
  const faturamentoData = await fetchBkFaturamentoData(startDate, endDate);
  
  // Filter for the specific item and transform to detail records
  const itemDetails = faturamentoData
    .filter(item => item.ITEM_CODIGO === itemCode && item.NOTA)
    .map(item => {
      // Get client correction factor if available (same as in financial service)
      const clienteInfo = (item as any).CLIENTE_INFO;
      const fatorCorrecao = clienteInfo?.FATOR_CORRECAO || null;
      
      // Apply correction factor in the same way as financial service
      const valorUnitario = item.VALOR_UNITARIO || 0;
      const valorUnitarioAjustado = (fatorCorrecao && fatorCorrecao > 0) 
        ? valorUnitario * fatorCorrecao 
        : valorUnitario;
      
      return {
        NOTA: item.NOTA || '',
        DATA_EMISSAO: item.DATA_EMISSAO ? new Date(item.DATA_EMISSAO).toISOString() : '',
        CLIENTE_NOME: clienteInfo ? (clienteInfo.APELIDO || clienteInfo.RAZAOSOCIAL || '') : '',
        PES_CODIGO: item.PES_CODIGO || 0,
        QUANTIDADE: item.QUANTIDADE || 0,
        VALOR_UNITARIO: valorUnitarioAjustado,
        FATOR_CORRECAO: fatorCorrecao
      };
    });
  
  // Sort by date (newest first)
  return itemDetails.sort((a, b) => {
    return new Date(b.DATA_EMISSAO).getTime() - new Date(a.DATA_EMISSAO).getTime();
  });
};

/**
 * Processes raw faturamento data into item report
 */
const processItemsReport = (
  data: BkFaturamento[], 
  itemInfoMap: Map<string, { descricao: string, grupoDescricao: string }>
): ItemReport[] => {
  const itemsMap = new Map<string, ItemReport>();
  
  data.forEach(item => {
    if (!item.ITEM_CODIGO) return;
    
    // Get client correction factor if available (same as in financial service)
    const clienteInfo = (item as any).CLIENTE_INFO;
    const fatorCorrecao = clienteInfo?.FATOR_CORRECAO || null;
    
    // Apply correction factor in the same way as financial service
    const valorUnitario = item.VALOR_UNITARIO || 0;
    const valorUnitarioAjustado = (fatorCorrecao && fatorCorrecao > 0) 
      ? valorUnitario * fatorCorrecao 
      : valorUnitario;
    
    // Calculate item value with correction factor applied
    const itemValue = (item.QUANTIDADE || 0) * valorUnitarioAjustado;
    
    const existingItem = itemsMap.get(item.ITEM_CODIGO);
    
    if (existingItem) {
      existingItem.TOTAL_QUANTIDADE += (item.QUANTIDADE || 0);
      existingItem.TOTAL_VALOR += itemValue;
      existingItem.OCORRENCIAS += 1;
    } else {
      // Get item info from the map we created earlier
      const itemInfo = itemInfoMap.get(item.ITEM_CODIGO) || { descricao: '', grupoDescricao: 'Sem Grupo' };
      
      itemsMap.set(item.ITEM_CODIGO, {
        ITEM_CODIGO: item.ITEM_CODIGO,
        DESCRICAO: itemInfo.descricao,
        GRU_DESCRICAO: itemInfo.grupoDescricao,
        TOTAL_QUANTIDADE: item.QUANTIDADE || 0,
        TOTAL_VALOR: itemValue,
        OCORRENCIAS: 1
      });
    }
  });
  
  // Convert map to array and sort by item code
  return Array.from(itemsMap.values())
    .sort((a, b) => a.ITEM_CODIGO.localeCompare(b.ITEM_CODIGO));
};
