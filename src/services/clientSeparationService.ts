import type { JabOrderItem } from "@/types/jabOrders";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Helper function to get client code from item
export function getClientCodeFromItem(item: any): string {
  return String(item.PES_CODIGO || '');
}

export async function createSeparacao(
  selectedItemsDetails: Record<string, { qtde: number; valor: number }>,
  clientGroups: Record<string, any>,
  displayName?: string
) {
  try {
    // If no items selected, show an error
    const selectedItems = Object.keys(selectedItemsDetails);
    if (selectedItems.length === 0) {
      toast({
        title: "Erro ao criar separação",
        description: "Nenhum item selecionado",
        variant: "destructive"
      });
      return null;
    }

    // Get first item to determine the client
    const firstItemId = selectedItems[0];
    
    // Find the item across all client groups
    let clientItem: JabOrderItem | null = null;
    let clientName = '';
    
    // Search for the item in all client groups
    for (const [name, group] of Object.entries(clientGroups)) {
      const foundItem = group.allItems.find((item: any) => 
        `${item.pedido}:${item.ITEM_CODIGO}` === firstItemId
      );
      
      if (foundItem) {
        clientItem = foundItem;
        clientName = name;
        break;
      }
    }
    
    if (!clientItem) {
      console.error('Item não encontrado em nenhum grupo de cliente:', firstItemId);
      return null;
    }
    
    // Create the separacao
    const clientCode = getClientCodeFromItem(clientItem);
    
    const { data: separacao, error: separacaoError } = await supabase
      .from('separacoes')
      .insert({
        cliente_nome: clientName,
        cliente_codigo: String(clientCode), // Convert to string explicitly
        status: 'pendente',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (separacaoError) {
      console.error('Erro ao criar separação:', separacaoError);
      throw separacaoError;
    }
    
    if (!separacao) {
      throw new Error('Nenhuma separação criada');
    }
    
    // Add items to separacao
    const itensParaInserir = selectedItems.map(itemId => {
      const [pedido, itemCodigo] = itemId.split(':');
      const details = selectedItemsDetails[itemId];
      
      return {
        separacao_id: separacao.id,
        item_codigo: itemCodigo,
        pedido: pedido,
        quantidade_pedida: details.qtde, // Renamed from 'quantidade' to match DB schema
        valor_unitario: details.valor,
        valor_total: details.qtde * details.valor, // Add required field
        created_at: new Date().toISOString()
      };
    });
    
    const { error: itensError } = await supabase
      .from('separacao_itens')
      .insert(itensParaInserir);
    
    if (itensError) {
      console.error('Erro ao inserir itens da separação:', itensError);
      
      // Rollback - delete the created separation
      await supabase
        .from('separacoes')
        .delete()
        .eq('id', separacao.id);
        
      throw itensError;
    }
    
    return separacao;
  } catch (error) {
    console.error('Erro ao criar separação:', error);
    toast({
      title: "Erro ao criar separação",
      description: String(error),
      variant: "destructive"
    });
    return null;
  }
}
