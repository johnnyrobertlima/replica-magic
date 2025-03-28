
import { supabase } from "@/integrations/supabase/client";
import { EstoqueItem } from "@/types/bk/estoque";

/**
 * Fetches all estoque data for the specified location
 */
export const fetchEstoqueData = async (local: number = 3) => {
  const { data: estoqueData, error: estoqueError } = await supabase
    .from('BLUEBAY_ESTOQUE')
    .select('*')
    .eq('LOCAL', local);

  if (estoqueError) throw estoqueError;
  
  return { estoqueData };
};

/**
 * Fetches item details in batches to avoid query limits
 */
export const fetchItemDetailsInBatches = async (itemCodes: string[], batchSize: number = 200) => {
  // Dividir em lotes menores para consulta
  const batches = [];
  
  for (let i = 0; i < itemCodes.length; i += batchSize) {
    batches.push(itemCodes.slice(i, i + batchSize));
  }
  
  // Processar todos os lotes sequencialmente
  let allItemsData: any[] = [];
  
  for (const batch of batches) {
    const { data: itemsData, error: itemsError } = await supabase
      .from('BLUEBAY_ITEM')
      .select('ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO')
      .in('ITEM_CODIGO', batch);

    if (itemsError) throw itemsError;
    
    if (itemsData) {
      allItemsData = [...allItemsData, ...itemsData];
    }
  }

  return allItemsData;
};

/**
 * Creates a map for quick access to item details
 */
export const createItemDetailsMap = (itemsData: any[]): Map<string, any> => {
  const itemMap = new Map();
  itemsData.forEach(item => {
    itemMap.set(item.ITEM_CODIGO, {
      DESCRICAO: item.DESCRICAO || 'Sem descrição',
      GRU_DESCRICAO: item.GRU_DESCRICAO || 'Sem grupo'
    });
  });
  return itemMap;
};

/**
 * Combines estoque data with item details
 */
export const combineEstoqueWithItemDetails = (estoqueData: any[], itemDetailsMap: Map<string, any>): EstoqueItem[] => {
  return estoqueData.map(estoque => {
    const itemInfo = itemDetailsMap.get(estoque.ITEM_CODIGO) || { DESCRICAO: 'Sem descrição', GRU_DESCRICAO: 'Sem grupo' };
    
    return {
      ITEM_CODIGO: estoque.ITEM_CODIGO,
      DESCRICAO: itemInfo.DESCRICAO,
      GRU_DESCRICAO: itemInfo.GRU_DESCRICAO,
      FISICO: estoque.FISICO,
      DISPONIVEL: estoque.DISPONIVEL,
      RESERVADO: estoque.RESERVADO,
      LOCAL: estoque.LOCAL,
      SUBLOCAL: estoque.SUBLOCAL
    };
  });
};
