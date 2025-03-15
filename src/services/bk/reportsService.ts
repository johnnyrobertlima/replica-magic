
import { supabase } from "@/integrations/supabase/client";

export interface ItemReport {
  ITEM_CODIGO: string;
  DESCRICAO?: string;
  TOTAL_QUANTIDADE: number;
  TOTAL_VALOR: number;
  OCORRENCIAS: number;
}

export interface ItemDetail {
  NOTA: string;
  DATA_EMISSAO: string;
  CLIENTE_NOME: string;
  PES_CODIGO: number;
  QUANTIDADE: number;
  VALOR_UNITARIO: number;
}

/**
 * Fetches faturamento data grouped by item code
 */
export const fetchBkItemsReport = async (
  startDate?: string,
  endDate?: string
): Promise<ItemReport[]> => {
  console.log("Fetching B&K items report data...", { startDate, endDate });
  
  // Query the faturamento data
  let query = supabase
    .from('BLUEBAY_FATURAMENTO')
    .select('*')
    .eq('TIPO', 'S');
  
  if (startDate) {
    query = query.gte('DATA_EMISSAO', startDate);
  }
  
  if (endDate) {
    query = query.lte('DATA_EMISSAO', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching B&K faturamento data:", error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length || 0} faturamento records`);
  
  // Group data by ITEM_CODIGO
  const itemsMap = new Map<string, ItemReport>();
  
  for (const item of data || []) {
    if (!item.ITEM_CODIGO) continue;
    
    const quantidade = item.QUANTIDADE || 0;
    const valorUnitario = item.VALOR_UNITARIO || 0;
    const valorTotal = quantidade * valorUnitario;
    
    if (itemsMap.has(item.ITEM_CODIGO)) {
      const existingItem = itemsMap.get(item.ITEM_CODIGO)!;
      existingItem.TOTAL_QUANTIDADE += quantidade;
      existingItem.TOTAL_VALOR += valorTotal;
      existingItem.OCORRENCIAS += 1;
    } else {
      itemsMap.set(item.ITEM_CODIGO, {
        ITEM_CODIGO: item.ITEM_CODIGO,
        DESCRICAO: null, // Will be populated later
        TOTAL_QUANTIDADE: quantidade,
        TOTAL_VALOR: valorTotal,
        OCORRENCIAS: 1
      });
    }
  }
  
  // Get descriptions for items
  const itemCodes = Array.from(itemsMap.keys());
  if (itemCodes.length > 0) {
    const { data: itemsData, error: itemsError } = await supabase
      .from('BLUEBAY_ITEM')
      .select('ITEM_CODIGO, DESCRICAO')
      .in('ITEM_CODIGO', itemCodes);
    
    if (!itemsError && itemsData) {
      for (const item of itemsData) {
        if (itemsMap.has(item.ITEM_CODIGO)) {
          itemsMap.get(item.ITEM_CODIGO)!.DESCRICAO = item.DESCRICAO;
        }
      }
    }
  }
  
  return Array.from(itemsMap.values());
};

/**
 * Fetches details for a specific item code
 */
export const fetchItemDetails = async (
  itemCode: string,
  startDate?: string,
  endDate?: string
): Promise<ItemDetail[]> => {
  console.log("Fetching details for item:", itemCode);
  
  let query = supabase
    .from('BLUEBAY_FATURAMENTO')
    .select('*')
    .eq('TIPO', 'S')
    .eq('ITEM_CODIGO', itemCode);
  
  if (startDate) {
    query = query.gte('DATA_EMISSAO', startDate);
  }
  
  if (endDate) {
    query = query.lte('DATA_EMISSAO', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching item details:", error);
    throw error;
  }
  
  console.log(`Fetched ${data?.length || 0} detail records for item ${itemCode}`);
  
  // Get client names
  const clientIds = data
    ?.map(item => item.PES_CODIGO)
    .filter(id => id !== null && !isNaN(Number(id))) || [];
  
  const clientsMap = new Map<number, string>();
  
  if (clientIds.length > 0) {
    const { data: clientsData, error: clientsError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
      .in('PES_CODIGO', clientIds);
    
    if (!clientsError && clientsData) {
      for (const client of clientsData) {
        clientsMap.set(
          client.PES_CODIGO, 
          client.APELIDO || client.RAZAOSOCIAL || `Cliente ${client.PES_CODIGO}`
        );
      }
    }
  }
  
  // Format the details
  return (data || []).map(item => ({
    NOTA: item.NOTA || '',
    DATA_EMISSAO: item.DATA_EMISSAO || '',
    CLIENTE_NOME: clientsMap.get(item.PES_CODIGO) || '',
    PES_CODIGO: item.PES_CODIGO || 0,
    QUANTIDADE: item.QUANTIDADE || 0,
    VALOR_UNITARIO: item.VALOR_UNITARIO || 0
  }));
};
