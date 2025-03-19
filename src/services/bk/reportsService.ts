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
): Promise<{
  ITEM_CODIGO: string;
  DESCRICAO: string;
  TOTAL_VALOR: number;
  TOTAL_QUANTIDADE: number;
}[]> => {
  try {
    const { data, error } = await supabase
      .from('vw_bk_items_report')
      .select('*')
      .gte('DATA_EMISSAO', startDate || '')
      .lte('DATA_EMISSAO', endDate || '');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching BK items report:', error);
    return [];
  }
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
 * Fetches and processes groups report data
 */
export const fetchBkGroupsReport = async (
  startDate?: string,
  endDate?: string
): Promise<{
  GRU_CODIGO: string;
  GRU_DESCRICAO: string;
  TOTAL_VALOR: number;
  TOTAL_QUANTIDADE: number;
}[]> => {
  try {
    const { data, error } = await supabase
      .from('vw_bk_groups_report')
      .select('*')
      .gte('DATA_EMISSAO', startDate || '')
      .lte('DATA_EMISSAO', endDate || '');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching BK groups report:', error);
    return [];
  }
};

/**
 * Processes raw faturamento data into item report
 */
const processItemsReport = (
  data: BkFaturamento[], 
  itemDescMap: Map<string, string>
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
      // Get item description from the map we created earlier
      const description = itemDescMap.get(item.ITEM_CODIGO) || '';
      
      itemsMap.set(item.ITEM_CODIGO, {
        ITEM_CODIGO: item.ITEM_CODIGO,
        DESCRICAO: description,
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
