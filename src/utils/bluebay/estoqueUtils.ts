
import { supabase } from "@/integrations/supabase/client";
import { EstoqueItem } from "@/types/bk/estoque";

/**
 * Fetches a page of estoque data with pagination
 * @param page Page number (0-based)
 * @param pageSize Number of items per page
 * @returns Object containing the page data and hasMore flag
 */
export const fetchEstoquePage = async (
  page: number,
  pageSize: number
): Promise<{ estoquePageData: any[]; hasMore: boolean }> => {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    console.log(`Buscando página ${page} de estoque (itens ${from}-${to})`);

    const { data, error, count } = await supabase
      .from("BLUEBAY_ESTOQUE")
      .select("*", { count: "exact" })
      .eq("LOCAL", 1)
      .range(from, to);

    if (error) {
      console.error("Erro ao buscar dados de estoque:", error.message);
      throw error;
    }

    // Determine if there are more pages
    const hasMore = count ? (page + 1) * pageSize < count : false;
    
    console.log(`Encontrados ${data?.length || 0} itens nesta página. Total estimado: ${count}`);
    return { estoquePageData: data || [], hasMore };
  } catch (error) {
    console.error(`Erro ao buscar página ${page} de estoque:`, error);
    throw error;
  }
};

/**
 * Fetches item details in batches to avoid query size limitations
 * @param itemCodes Array of item codes
 * @returns Array of item details
 */
export const fetchItemDetailsInBatches = async (itemCodes: string[]): Promise<any[]> => {
  try {
    // Using batches to avoid query size limitations
    const batchSize = 500; // Adjusted batch size
    let allItemsData: any[] = [];
    
    console.log(`Buscando detalhes para ${itemCodes.length} itens em lotes de ${batchSize}`);
    
    for (let i = 0; i < itemCodes.length; i += batchSize) {
      const batchCodes = itemCodes.slice(i, i + batchSize);
      
      console.log(`Processando lote ${Math.floor(i/batchSize) + 1} de ${Math.ceil(itemCodes.length/batchSize)} (${batchCodes.length} itens)`);
      
      const { data, error } = await supabase
        .from("BLUEBAY_ITEM")
        .select("*")
        .in("ITEM_CODIGO", batchCodes);
      
      if (error) {
        console.error(`Erro ao buscar lote de itens ${i}-${i+batchSize}:`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        allItemsData = [...allItemsData, ...data];
      }
    }
    
    console.log(`Total de ${allItemsData.length} detalhes de itens encontrados`);
    return allItemsData;
  } catch (error) {
    console.error("Erro ao buscar detalhes dos itens:", error);
    throw error;
  }
};

/**
 * Creates a map of item details for efficient lookup
 * @param itemsData Array of item details
 * @returns Map of item details indexed by item code
 */
export const createItemDetailsMap = (itemsData: any[]): Map<string, any> => {
  const itemMap = new Map();
  itemsData.forEach(item => {
    itemMap.set(item.ITEM_CODIGO, item);
  });
  return itemMap;
};

/**
 * Combines estoque data with item details
 * @param estoqueData Array of estoque data
 * @param itemMap Map of item details
 * @returns Array of combined estoque items
 */
export const combineEstoqueWithItemDetails = (
  estoqueData: any[],
  itemMap: Map<string, any>
): EstoqueItem[] => {
  return estoqueData.map(estoque => {
    const itemDetails = itemMap.get(estoque.ITEM_CODIGO) || {};
    return {
      ITEM_CODIGO: estoque.ITEM_CODIGO,
      DESCRICAO: itemDetails.DESCRICAO || "Sem descrição",
      FISICO: Number(estoque.FISICO) || 0,
      DISPONIVEL: Number(estoque.DISPONIVEL) || 0,
      RESERVADO: Number(estoque.RESERVADO) || 0,
      LOCAL: Number(estoque.LOCAL) || 0,
      SUBLOCAL: estoque.SUBLOCAL || "",
      GRU_DESCRICAO: itemDetails.GRU_DESCRICAO || "Sem grupo"
    };
  });
};

// Legacy method kept for backward compatibility
export const fetchEstoqueData = async (local: number = 1) => {
  console.warn("Deprecated: fetchEstoqueData is limited to 1000 items. Use fetchAllEstoqueData instead.");
  try {
    const { data: estoqueData, error } = await supabase
      .from("BLUEBAY_ESTOQUE")
      .select("*")
      .eq("LOCAL", local)
      .limit(1000);

    if (error) {
      console.error("Erro ao buscar dados de estoque:", error);
      throw error;
    }

    return { estoqueData: estoqueData || [] };
  } catch (error) {
    console.error("Erro ao buscar dados de estoque:", error);
    throw error;
  }
};
