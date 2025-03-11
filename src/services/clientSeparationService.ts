
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { JabOrderItem } from "@/types/jabOrders";
import { getClientCodeFromItem } from "@/utils/clientOrdersUtils";

interface CreateSeparationResult {
  success: boolean;
  error?: any;
  data?: any;
}

export const createSeparation = async (
  items: (JabOrderItem & { 
    PES_CODIGO?: number;
    APELIDO?: string | null;
    valor_total?: number;
    pedido?: string;
  })[], 
  clientName: string
): Promise<CreateSeparationResult> => {
  try {
    if (!items.length) {
      return { success: false, error: "Nenhum item selecionado" };
    }

    // Get client code from the first item
    const clientCode = getClientCodeFromItem(items[0]);
    
    if (!clientCode) {
      return { success: false, error: "Código do cliente não encontrado" };
    }

    // Calculate total value
    const totalValue = items.reduce((sum, item) => sum + (
      (item.QTDE_SALDO || 0) * (item.VALOR_UNITARIO || 0)
    ), 0);

    // Create separacao record
    const { data: separacao, error: separacaoError } = await supabase
      .from('separacoes')
      .insert({
        cliente_codigo: clientCode,
        cliente_nome: clientName,
        quantidade_itens: items.length,
        valor_total: totalValue,
        status: 'pendente'
      })
      .select()
      .single();

    if (separacaoError) {
      console.error("Erro ao criar separação:", separacaoError);
      return { success: false, error: separacaoError };
    }

    // Create separacao_itens records
    const separacaoItens = items.map(item => ({
      separacao_id: separacao.id,
      item_codigo: item.ITEM_CODIGO,
      descricao: item.DESCRICAO || '',
      quantidade_pedida: item.QTDE_SALDO || 0,
      valor_unitario: item.VALOR_UNITARIO || 0,
      valor_total: (item.QTDE_SALDO || 0) * (item.VALOR_UNITARIO || 0),
      pedido: item.pedido || ''
    }));

    const { error: itensError } = await supabase
      .from('separacao_itens')
      .insert(separacaoItens);

    if (itensError) {
      console.error("Erro ao adicionar itens à separação:", itensError);
      
      // If there's an error with items, delete the separation
      await supabase
        .from('separacoes')
        .delete()
        .eq('id', separacao.id);
        
      return { success: false, error: itensError };
    }

    return { 
      success: true, 
      data: {
        ...separacao,
        itens: separacaoItens
      } 
    };
  } catch (error) {
    console.error("Erro ao criar separação:", error);
    return { success: false, error };
  }
};

export const updateSeparacaoStatus = async (id: string, status: 'pendente' | 'separado' | 'cancelado') => {
  try {
    const { data, error } = await supabase
      .from('separacoes')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Erro ao atualizar status da separação:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao atualizar status da separação:", error);
    return { success: false, error };
  }
};

export const deleteSeparacao = async (id: string) => {
  try {
    // First delete the items
    const { error: itemsError } = await supabase
      .from('separacao_itens')
      .delete()
      .eq('separacao_id', id);

    if (itemsError) {
      console.error("Erro ao excluir itens da separação:", itemsError);
      return { success: false, error: itemsError };
    }

    // Then delete the separation
    const { error } = await supabase
      .from('separacoes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Erro ao excluir separação:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir separação:", error);
    return { success: false, error };
  }
};
