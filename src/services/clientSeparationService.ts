
import { supabase } from '@/integrations/supabase/client';

interface SeparationItem {
  itemCodigo: string;
  pedido: string;
  pesCodigo: string | number;
  descricao?: string | null;
  qtdeSaldo: number;
  valorUnitario: number;
}

interface SeparationRequest {
  items: SeparationItem[];
}

export async function sendToSeparation({ items }: SeparationRequest) {
  try {
    if (!items || items.length === 0) {
      console.error("No items provided for separation");
      throw new Error('Nenhum item fornecido para separação');
    }

    console.log("Starting sendToSeparation with items:", items);
    
    // Group items by cliente (PES_CODIGO)
    const itemsByCliente: Record<string, SeparationItem[]> = {};
    items.forEach(item => {
      if (!item.pesCodigo) {
        console.warn(`Missing PES_CODIGO for item ${item.itemCodigo}`);
        return;
      }
      
      const clienteKey = item.pesCodigo.toString();
      if (!itemsByCliente[clienteKey]) {
        itemsByCliente[clienteKey] = [];
      }
      
      // Garantir que o pedido original seja mantido
      console.log(`Adicionando item ${item.itemCodigo} ao cliente ${clienteKey} com pedido original: ${item.pedido}`);
      itemsByCliente[clienteKey].push(item);
    });

    console.log("Items grouped by client with original pedidos:", itemsByCliente);

    // Create a separation for each cliente
    const separations = [];
    for (const [clienteKey, clienteItems] of Object.entries(itemsByCliente)) {
      if (clienteItems.length === 0) continue;
      
      const clienteNumerico = parseInt(clienteKey);
      if (isNaN(clienteNumerico)) {
        console.warn(`Invalid client code: ${clienteKey}`);
        continue;
      }
      
      console.log(`Creating separation for client ${clienteKey} with ${clienteItems.length} items`);
      
      const valorTotal = clienteItems.reduce((sum, item) => sum + (item.qtdeSaldo * item.valorUnitario), 0);
      
      const { data, error } = await supabase
        .from('separacoes')
        .insert({
          cliente_codigo: clienteNumerico,
          cliente_nome: 'Cliente ' + clienteKey, // Substituir com o nome real do cliente se disponível
          quantidade_itens: clienteItems.length,
          valor_total: valorTotal,
          status: 'pendente'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar separação:', error);
        throw new Error(`Falha ao criar separação: ${error.message}`);
      }

      console.log("Separation created:", data);

      // Add separation items with original pedido numbers
      const separationItems = clienteItems.map(item => ({
        separacao_id: data.id,
        pedido: item.pedido,  // Manter o pedido original
        item_codigo: item.itemCodigo,
        descricao: item.descricao,
        quantidade_pedida: item.qtdeSaldo,
        valor_unitario: item.valorUnitario,
        valor_total: item.qtdeSaldo * item.valorUnitario
      }));

      console.log("Inserting separation items with original pedidos:", separationItems);

      const { error: itemsError } = await supabase
        .from('separacao_itens')
        .insert(separationItems);

      if (itemsError) {
        console.error('Erro ao inserir itens:', itemsError);
        throw new Error(`Falha ao inserir itens: ${itemsError.message}`);
      }

      separations.push(data);
    }

    console.log("Separation process completed successfully with original pedidos");
    return { success: true, separations };
  } catch (error: any) {
    console.error('Erro no processo de separação:', error);
    throw error;
  }
}

// Alias for backward compatibility
export const sendOrdersForSeparation = sendToSeparation;
