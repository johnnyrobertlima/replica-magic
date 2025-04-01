
import { supabase } from "@/integrations/supabase/client";
import { EstoqueItem } from "@/types/bk/estoque";

/**
 * Fetches estoque items where LOCAL = 4
 */
export const fetchReportItems = async (): Promise<EstoqueItem[]> => {
  console.log("Fetching report items with LOCAL = 4");
  
  try {
    // Fetch items with LOCAL = 4
    const { data: estoqueData, error: estoqueError } = await supabase
      .from('BLUEBAY_ESTOQUE')
      .select('*')
      .eq('LOCAL', 4);

    if (estoqueError) {
      console.error("Error fetching report items:", estoqueError);
      throw estoqueError;
    }
    
    if (!estoqueData?.length) {
      console.log("No items found with LOCAL = 4");
      return [];
    }
    
    console.log(`Found ${estoqueData.length} items with LOCAL = 4`);
    
    // Get unique item codes
    const itemCodes = estoqueData.map(item => item.ITEM_CODIGO);
    
    // Fetch item details
    const { data: itemsData, error: itemsError } = await supabase
      .from('BLUEBAY_ITEM')
      .select('ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO')
      .in('ITEM_CODIGO', itemCodes);

    if (itemsError) {
      console.error("Error fetching item details:", itemsError);
      throw itemsError;
    }
    
    // Create a map for easy lookup
    const itemDetailsMap = new Map();
    if (itemsData) {
      itemsData.forEach(item => {
        itemDetailsMap.set(item.ITEM_CODIGO, {
          DESCRICAO: item.DESCRICAO || 'Sem descrição',
          GRU_DESCRICAO: item.GRU_DESCRICAO || 'Sem grupo'
        });
      });
    }
    
    // Combine estoque data with item details
    const combinedItems: EstoqueItem[] = estoqueData.map(estoque => {
      const itemInfo = itemDetailsMap.get(estoque.ITEM_CODIGO) || { 
        DESCRICAO: 'Sem descrição', 
        GRU_DESCRICAO: 'Sem grupo' 
      };
      
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
    
    return combinedItems;
  } catch (error) {
    console.error("Error in fetchReportItems:", error);
    throw error;
  }
};
