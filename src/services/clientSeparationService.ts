import { supabase } from "@/integrations/supabase/client";
import type { ClienteFinanceiro } from "@/types/financialClient";

export const sendOrdersForSeparation = async (selectedItems: string[], clienteData: ClienteFinanceiro) => {
  try {
    // Validate input
    if (!selectedItems || selectedItems.length === 0) {
      return { success: false, error: "No items selected for separation" };
    }

    // Get the client code
    const clienteCodigo = clienteData.PES_CODIGO;
    if (!clienteCodigo) {
      return { success: false, error: "Client code is missing" };
    }

    // Find the items in the client's separations
    const allSeparationItems = clienteData.separacoes.flatMap(sep => sep.separacao_itens || []);
    const itemsToSeparate = allSeparationItems.filter(item => 
      selectedItems.includes(item.item_codigo)
    );

    if (itemsToSeparate.length === 0) {
      return { success: false, error: "No matching items found in client separations" };
    }

    // Create a new separation record
    const { data: separationData, error: separationError } = await supabase
      .from('separacoes')
      .insert({
        cliente_codigo: clienteCodigo,
        status: 'pending',
        created_at: new Date().toISOString(),
        valor_total: itemsToSeparate.reduce((sum, item) => 
          sum + (item.valor_unitario * item.quantidade_pedida), 0)
      })
      .select()
      .single();

    if (separationError) {
      console.error("Error creating separation:", separationError);
      return { success: false, error: separationError };
    }

    // Create separation items
    const separationItems = itemsToSeparate.map(item => ({
      separacao_id: separationData.id,
      item_codigo: item.item_codigo,
      descricao: item.descricao,
      quantidade_pedida: item.quantidade_pedida,
      valor_unitario: item.valor_unitario,
      pedido: item.pedido
    }));

    const { error: itemsError } = await supabase
      .from('separacao_itens')
      .insert(separationItems);

    if (itemsError) {
      console.error("Error creating separation items:", itemsError);
      // Try to rollback the separation
      await supabase.from('separacoes').delete().eq('id', separationData.id);
      return { success: false, error: itemsError };
    }

    // Update the status of the original items to mark them as in separation
    for (const item of itemsToSeparate) {
      if (item.id) {
        await supabase
          .from('separacao_itens')
          .update({ status: 'in_separation' })
          .eq('id', item.id);
      }
    }

    return { 
      success: true, 
      data: {
        separationId: separationData.id,
        itemCount: separationItems.length
      }
    };
  } catch (error) {
    console.error('Error sending orders for separation:', error);
    return { success: false, error };
  }
};
