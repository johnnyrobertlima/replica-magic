
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
      throw new Error('Nenhum item fornecido para separação');
    }

    const user = await supabase.auth.getUser();
    
    if (!user || !user.data || !user.data.user) {
      throw new Error('Usuário não autenticado');
    }

    const userId = user.data.user.id;
    const userEmail = user.data.user.email;

    // Group items by cliente (PES_CODIGO)
    const itemsByCliente: Record<string, SeparationItem[]> = {};
    items.forEach(item => {
      const clienteKey = item.pesCodigo.toString();
      if (!itemsByCliente[clienteKey]) {
        itemsByCliente[clienteKey] = [];
      }
      itemsByCliente[clienteKey].push(item);
    });

    // Create a separation for each cliente
    const separations = [];
    for (const [clienteKey, clienteItems] of Object.entries(itemsByCliente)) {
      const { data, error } = await supabase
        .from('separacoes')
        .insert({
          cliente_codigo: parseInt(clienteKey), // Convert to number for the DB
          cliente_nome: 'Cliente ' + clienteKey, // This should be replaced with actual client name if available
          user_id: userId,
          user_email: userEmail,
          quantidade_itens: clienteItems.length,
          valor_total: clienteItems.reduce((sum, item) => sum + (item.qtdeSaldo * item.valorUnitario), 0),
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar separação:', error);
        throw new Error(`Falha ao criar separação: ${error.message}`);
      }

      // Add separation items
      const separationItems = clienteItems.map(item => ({
        separacao_id: data.id,
        pedido: item.pedido,
        item_codigo: item.itemCodigo,
        descricao: item.descricao,
        quantidade_pedida: item.qtdeSaldo,
        valor_unitario: item.valorUnitario,
        valor_total: item.qtdeSaldo * item.valorUnitario
      }));

      const { error: itemsError } = await supabase
        .from('separacao_itens')
        .insert(separationItems);

      if (itemsError) {
        console.error('Erro ao inserir itens:', itemsError);
        throw new Error(`Falha ao inserir itens: ${itemsError.message}`);
      }

      separations.push(data);
    }

    return { success: true, separations };
  } catch (error: any) {
    console.error('Erro no processo de separação:', error);
    return { success: false, error: error.message || 'Falha desconhecida na separação' };
  }
}

// Alias for backward compatibility
export const sendOrdersForSeparation = sendToSeparation;
