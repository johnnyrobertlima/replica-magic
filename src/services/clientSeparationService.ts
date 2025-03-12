
import { supabase } from "@/integrations/supabase/client";
import { JabOrdersResponse } from "@/types/jabOrders";
import { ClienteFinanceiro } from "@/types/financialClient";

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
  clienteFinanceiro: ClienteFinanceiro
) => {
  try {
    console.log('Sending orders for separation:', orderIds, clienteFinanceiro);
    
    // Converter o PES_CODIGO para número para inserção no banco de dados
    const clienteCodigoNumber = parseInt(clienteFinanceiro.PES_CODIGO, 10);
    
    // Create a proper separation record
    const { data, error } = await supabase
      .from('separacoes')
      .insert({
        cliente_codigo: clienteCodigoNumber, // Usando o valor numérico convertido
        cliente_nome: clienteFinanceiro.APELIDO || `Cliente ${clienteFinanceiro.PES_CODIGO}`,
        status: 'pending',
        created_at: new Date().toISOString(),
        quantidade_itens: orderIds.length,
        valor_total: clienteFinanceiro.valoresEmAberto || 0
      });
      
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
