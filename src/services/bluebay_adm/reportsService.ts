
import { supabase } from "@/integrations/supabase/client";
import { EstoqueItem } from "@/types/bk/estoque";

/**
 * Fetches estoque items where LOCAL = 4 or CENTROCUSTO = BLUEBAY
 */
export const fetchReportItems = async (): Promise<EstoqueItem[]> => {
  console.log("Fetching report items with LOCAL = 4 or CENTROCUSTO = BLUEBAY");
  
  try {
    // Fetch items with LOCAL = 4
    const { data: estoqueData, error: estoqueError } = await supabase
      .from('BLUEBAY_ESTOQUE')
      .select('*')
      .eq('LOCAL', 4);

    if (estoqueError) {
      console.error("Error fetching report items from estoque:", estoqueError);
      throw estoqueError;
    }
    
    // Fetch pedidos with CENTROCUSTO = BLUEBAY
    const { data: pedidosData, error: pedidosError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .eq('CENTROCUSTO', 'BLUEBAY');
    
    if (pedidosError) {
      console.error("Error fetching report items from pedidos:", pedidosError);
      throw pedidosError;
    }
    
    let combinedEstoqueItems = estoqueData || [];
    console.log(`Found ${combinedEstoqueItems.length} items with LOCAL = 4`);
    console.log(`Found ${pedidosData?.length || 0} items with CENTROCUSTO = BLUEBAY`);
    
    // If we don't have any data from either source, return empty array
    if (!combinedEstoqueItems.length && (!pedidosData || !pedidosData.length)) {
      console.log("No items found with LOCAL = 4 or CENTROCUSTO = BLUEBAY");
      return [];
    }
    
    // Get unique item codes from both sources
    const estoqueItemCodes = estoqueData?.map(item => item.ITEM_CODIGO) || [];
    const pedidoItemCodes = pedidosData?.map(item => item.ITEM_CODIGO).filter(Boolean) || [];
    const itemCodes = [...new Set([...estoqueItemCodes, ...pedidoItemCodes])];
    
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
    const combinedItems: EstoqueItem[] = estoqueItemCodes.map(itemCode => {
      const estoqueItem = estoqueData?.find(e => e.ITEM_CODIGO === itemCode);
      const itemInfo = itemDetailsMap.get(itemCode) || { 
        DESCRICAO: 'Sem descrição', 
        GRU_DESCRICAO: 'Sem grupo' 
      };
      
      return {
        ITEM_CODIGO: itemCode,
        DESCRICAO: itemInfo.DESCRICAO,
        GRU_DESCRICAO: itemInfo.GRU_DESCRICAO,
        FISICO: estoqueItem?.FISICO || 0,
        DISPONIVEL: estoqueItem?.DISPONIVEL || 0,
        RESERVADO: estoqueItem?.RESERVADO || 0,
        LOCAL: estoqueItem?.LOCAL || 4,
        SUBLOCAL: estoqueItem?.SUBLOCAL || ''
      };
    });
    
    // Add items that are only in PEDIDO with CENTROCUSTO = BLUEBAY
    // but not in ESTOQUE with LOCAL = 4
    const onlyInPedidoItemCodes = pedidoItemCodes.filter(code => !estoqueItemCodes.includes(code));
    
    if (onlyInPedidoItemCodes.length > 0) {
      const pedidoOnlyItems = onlyInPedidoItemCodes.map(itemCode => {
        const itemInfo = itemDetailsMap.get(itemCode) || { 
          DESCRICAO: 'Sem descrição', 
          GRU_DESCRICAO: 'Sem grupo' 
        };
        
        return {
          ITEM_CODIGO: itemCode,
          DESCRICAO: itemInfo.DESCRICAO,
          GRU_DESCRICAO: itemInfo.GRU_DESCRICAO,
          FISICO: 0,
          DISPONIVEL: 0,
          RESERVADO: 0,
          LOCAL: 4,
          SUBLOCAL: 'BLUEBAY'
        };
      });
      
      combinedItems.push(...pedidoOnlyItems);
    }
    
    return combinedItems;
  } catch (error) {
    console.error("Error in fetchReportItems:", error);
    throw error;
  }
};
