
import { supabase } from "@/integrations/supabase/client";
import { EstoqueItem } from "@/types/bk/estoque";

/**
 * Fetches a page of estoque data from Supabase
 */
export const fetchEstoquePage = async (pageNumber: number, pageSize: number) => {
  console.log(`📄 Buscando página ${pageNumber + 1} de análise de compra (itens ${pageNumber * pageSize} a ${(pageNumber + 1) * pageSize - 1})`);
  
  const { data: estoquePageData, error: estoqueError } = await supabase
    .from('BLUEBAY_ESTOQUE')
    .select('*')
    .eq('LOCAL', 1)
    .range(pageNumber * pageSize, (pageNumber + 1) * pageSize - 1);
    
  if (estoqueError) {
    console.error(`❌ Erro ao buscar página ${pageNumber + 1} da análise de compra:`, estoqueError);
    throw estoqueError;
  }
  
  return { estoquePageData, hasMore: estoquePageData && estoquePageData.length === pageSize };
};

/**
 * Fetches item details in batches to avoid query limits
 */
export const fetchItemDetailsInBatches = async (itemCodes: string[], batchSize: number = 500) => {
  // Dividir em lotes menores para consulta
  const batches = [];
  
  for (let i = 0; i < itemCodes.length; i += batchSize) {
    batches.push(itemCodes.slice(i, i + batchSize));
  }
  
  console.log(`📦 Dividido em ${batches.length} lotes com até ${batchSize} itens cada`);
  
  // Processar todos os lotes sequencialmente
  let allItemsData: any[] = [];
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`⏳ Processando lote ${i+1} de ${batches.length} (${batch.length} itens)`);
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('BLUEBAY_ITEM')
      .select('ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO')
      .in('ITEM_CODIGO', batch);

    if (itemsError) {
      console.error(`❌ Erro no lote ${i+1}:`, itemsError);
      throw itemsError;
    }
    
    if (itemsData) {
      allItemsData = [...allItemsData, ...itemsData];
      console.log(`✅ Lote ${i+1} processado, total de itens até agora: ${allItemsData.length}`);
    }
  }

  return allItemsData;
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
