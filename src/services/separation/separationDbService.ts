
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Creates a new separation record in the database
 */
export const createSeparation = async (
  clientName: string, 
  clienteCode: number,
  items: any[],
  valorTotal: number
) => {
  console.log(`Inserindo separação para ${clientName} com código ${clienteCode}`);
  const { data: separacao, error: separacaoError } = await supabase
    .from('separacoes')
    .insert({
      cliente_nome: clientName,
      cliente_codigo: clienteCode,
      quantidade_itens: items.length,
      valor_total: valorTotal,
      status: 'pendente'
    })
    .select()
    .single();

  if (separacaoError) {
    console.error('Erro ao criar separação:', separacaoError);
    throw new Error(`Erro ao criar separação para ${clientName}`);
  }
  
  return separacao;
};

/**
 * Creates separation items in the database
 */
export const createSeparationItems = async (
  separacaoId: string, 
  items: any[]
) => {
  const separacaoItens = items.map(({ pedido, item }) => ({
    separacao_id: separacaoId,
    pedido: pedido,
    item_codigo: item.ITEM_CODIGO,
    descricao: item.DESCRICAO,
    quantidade_pedida: item.QTDE_SALDO,
    valor_unitario: item.VALOR_UNITARIO,
    valor_total: item.QTDE_SALDO * item.VALOR_UNITARIO
  }));

  console.log(`Inserindo itens para separação ${separacaoId}`);
  const { error: itensError } = await supabase
    .from('separacao_itens')
    .insert(separacaoItens);

  if (itensError) {
    console.error('Erro ao inserir itens:', itensError);
    throw new Error(`Erro ao inserir itens para separação ${separacaoId}`);
  }
};
