
import { supabase } from "@/integrations/supabase/client";
import { JabOrdersResponse } from "@/types/jabOrders";

// Fetch estoque data for a specific item
export const getEstoqueForItem = async (itemCodigo: string) => {
  try {
    const { data, error } = await supabase
      .from('BLUEBAY_ESTOQUE')
      .select('*')
      .eq('ITEM_CODIGO', itemCodigo)
      .single();

    if (error) {
      console.error(`Error fetching estoque for item ${itemCodigo}:`, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Error in getEstoqueForItem for ${itemCodigo}:`, error);
    return null;
  }
};

// Get all items that have estoque
export const getItemsWithEstoque = async () => {
  try {
    const { data, error } = await supabase
      .from('BLUEBAY_ESTOQUE')
      .select('*')
      .gt('FISICO', 0);

    if (error) {
      console.error('Error fetching items with estoque:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getItemsWithEstoque:', error);
    return [];
  }
};

// Process orders to mark items that are in separation
export const processOrdersWithSeparationStatus = (
  orders: JabOrdersResponse, 
  separations: Record<string, any[]>
) => {
  // Implementation will depend on your data structure
  return orders;
};
