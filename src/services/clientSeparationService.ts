
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

// Send orders for separation
export const sendOrdersForSeparation = async (
  orderIds: string[],
  selectedItems: Record<string, string[]>
) => {
  try {
    // Implementation for sending orders for separation
    // This is a placeholder since the actual implementation depends on your requirements
    console.log('Sending orders for separation:', orderIds, selectedItems);
    
    // Replace with actual API call or database operation
    const { data, error } = await supabase
      .from('separacoes')
      .insert(
        orderIds.map(orderId => ({
          order_id: orderId,
          items: selectedItems[orderId] || [],
          status: 'pending',
          created_at: new Date().toISOString()
        }))
      );
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending orders for separation:', error);
    return { success: false, error };
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
