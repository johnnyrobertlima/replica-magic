
import { supabase } from "@/integrations/supabase/client";
import { ClienteFinanceiro } from "@/types/financialClient";
import { getCachedEstoque } from "./jabOrdersService";

export const sendOrdersForSeparation = async (
  selectedItems: string[],
  clienteFinanceiro: ClienteFinanceiro
) => {
  if (!clienteFinanceiro || !selectedItems || selectedItems.length === 0) {
    throw new Error("Dados inválidos para separação");
  }

  try {
    // Create separacao record
    const separacaoData = {
      cliente_codigo: clienteFinanceiro.PES_CODIGO,
      cliente_nome: clienteFinanceiro.APELIDO,
      status: "pendente",
      created_at: new Date().toISOString(),
      valor_total: calculateTotalValue(selectedItems, clienteFinanceiro)
    };

    const { data: separacao, error: separacaoError } = await supabase
      .from("separacoes")
      .insert(separacaoData)
      .select()
      .single();

    if (separacaoError) {
      console.error("Erro ao criar separação:", separacaoError);
      throw separacaoError;
    }

    // Get items from cliente
    const itensSelecionados = getSelectedItems(selectedItems, clienteFinanceiro);

    if (itensSelecionados.length === 0) {
      throw new Error("Não foram encontrados itens válidos para separação");
    }

    // Create separacao_itens records for each selected item
    const separacaoItensData = itensSelecionados.map(item => {
      return {
        separacao_id: separacao.id,
        item_codigo: item.ITEM_CODIGO,
        descricao: item.DESCRICAO,
        quantidade_pedida: item.QTDE_SALDO,
        valor_unitario: item.VALOR_UNITARIO,
        pedido: item.pedido,
        valor_total: item.valor_total
      };
    });

    const { error: itensError } = await supabase
      .from("separacao_itens")
      .insert(separacaoItensData);

    if (itensError) {
      console.error("Erro ao criar itens de separação:", itensError);
      
      // Rollback by deleting the separacao record
      await supabase
        .from("separacoes")
        .delete()
        .eq("id", separacao.id);
        
      throw itensError;
    }

    // Update separacao with the number of items
    const { error: updateError } = await supabase
      .from("separacoes")
      .update({ quantidade_itens: itensSelecionados.length })
      .eq("id", separacao.id);

    if (updateError) {
      console.error("Erro ao atualizar quantidade de itens:", updateError);
      // Not critical, can continue
    }

    return { success: true, separacaoId: separacao.id };
  } catch (error) {
    console.error("Erro ao criar separação:", error);
    return { success: false, error };
  }
};

// Helper to calculate the total value of selected items
const calculateTotalValue = (selectedItems: string[], cliente: ClienteFinanceiro) => {
  let total = 0;
  
  if (!cliente.separacoes || cliente.separacoes.length === 0) {
    return total;
  }
  
  const allItems = cliente.separacoes[0].separacao_itens || [];
  
  for (const item of allItems) {
    if (selectedItems.includes(item.ITEM_CODIGO)) {
      total += item.valor_total || 0;
    }
  }
  
  return total;
};

// Helper to get the selected items data
const getSelectedItems = (selectedItems: string[], cliente: ClienteFinanceiro) => {
  if (!cliente.separacoes || cliente.separacoes.length === 0) {
    return [];
  }
  
  const allItems = cliente.separacoes[0].separacao_itens || [];
  return allItems.filter(item => selectedItems.includes(item.ITEM_CODIGO));
};
