
import { supabase } from "@/integrations/supabase/client";
import type { ClienteFinanceiro } from "@/types/financialClient";

export async function sendOrdersForSeparation(
  selectedItems: string[],
  clienteData: ClienteFinanceiro
) {
  try {
    // Get current date
    const currentDate = new Date().toISOString();
    
    // Calculate total values
    const allItems = clienteData.separacoes[0]?.separacao_itens || [];
    const selectedItemsData = allItems.filter((item: any) => 
      selectedItems.includes(item.ITEM_CODIGO)
    );
    
    if (selectedItemsData.length === 0) {
      return { success: false, error: "No items selected" };
    }
    
    const valorTotal = selectedItemsData.reduce(
      (acc: number, item: any) => acc + (item.VALOR_UNITARIO || 0) * (item.QTDE_SALDO || 0),
      0
    );
    
    // Create a new separation record
    const { data: separacaoData, error: separacaoError } = await supabase
      .from("separacoes")
      .insert({
        cliente_codigo: clienteData.PES_CODIGO,
        cliente_nome: clienteData.APELIDO || "",
        status: "pendente",
        created_at: currentDate,
        valor_total: valorTotal,
        quantidade_itens: selectedItemsData.length
      })
      .select()
      .single();
    
    if (separacaoError) {
      console.error("Error creating separation:", separacaoError);
      return { success: false, error: separacaoError };
    }
    
    // Create separation items
    const separacaoItems = selectedItemsData.map((item: any) => ({
      separacao_id: separacaoData.id,
      item_codigo: item.ITEM_CODIGO,
      descricao: item.DESCRICAO,
      quantidade_pedida: item.QTDE_SALDO,
      valor_unitario: item.VALOR_UNITARIO,
      valor_total: (item.QTDE_SALDO || 0) * (item.VALOR_UNITARIO || 0),
      pedido: item.pedido
    }));
    
    const { error: itemsError } = await supabase
      .from("separacao_itens")
      .insert(separacaoItems);
    
    if (itemsError) {
      console.error("Error creating separation items:", itemsError);
      
      // Rollback separation if items couldn't be created
      await supabase
        .from("separacoes")
        .delete()
        .eq("id", separacaoData.id);
        
      return { success: false, error: itemsError };
    }
    
    // Update the status of the separation
    const { error: updateError } = await supabase
      .from("separacoes")
      .update({ status: "pendente" })
      .eq("id", separacaoData.id);
    
    if (updateError) {
      console.error("Error updating separation status:", updateError);
    }
    
    return { success: true, data: separacaoData };
  } catch (error) {
    console.error("Error in sendOrdersForSeparation:", error);
    return { success: false, error };
  }
}
