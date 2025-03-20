
import { supabase } from '@/integrations/supabase/client';

interface SeparationItem {
  itemCodigo: string;
  pedido: string;
  pesCodigo: string | number;
  descricao?: string | null;
  qtdeSaldo: number;
  valorUnitario: number;
  centrocusto?: 'JAB' | 'BK';
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

    // Use the first item's centrocusto as the separation's centrocusto
    const centrocusto = items[0].centrocusto || 'JAB';

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
          user_id: userId,
          user_email: userEmail,
          cliente_codigo: clienteKey,
          items: clienteItems,
          status: 'pending',
          centrocusto
        })
        .select('*')
        .single();

      if (error) {
        console.error('Erro ao criar separação:', error);
        throw new Error(`Falha ao criar separação: ${error.message}`);
      }

      separations.push(data);
    }

    return { success: true, separations };
  } catch (error: any) {
    console.error('Erro no processo de separação:', error);
    return { success: false, error: error.message || 'Falha desconhecida na separação' };
  }
}
