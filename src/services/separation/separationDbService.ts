
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
  // Garantir que o campo pedido seja armazenado corretamente para cada item
  const separacaoItens = items.map(({ pedido, item }) => {
    // Priorizar o pedido explícito que veio da seleção original
    const pedidoOriginal = pedido || '';
    
    console.log(`Salvando item de separação: Item ${item.ITEM_CODIGO}, Pedido original: ${pedidoOriginal}`);
    
    return {
      separacao_id: separacaoId,
      pedido: pedidoOriginal, // Usar o número do pedido original
      item_codigo: item.ITEM_CODIGO,
      descricao: item.DESCRICAO,
      quantidade_pedida: item.QTDE_SALDO,
      valor_unitario: item.VALOR_UNITARIO,
      valor_total: item.QTDE_SALDO * item.VALOR_UNITARIO
    };
  });

  console.log(`Inserindo ${separacaoItens.length} itens para separação ${separacaoId} com pedidos originais`);
  const { error: itensError } = await supabase
    .from('separacao_itens')
    .insert(separacaoItens);

  if (itensError) {
    console.error('Erro ao inserir itens:', itensError);
    throw new Error(`Erro ao inserir itens para separação ${separacaoId}`);
  }
};

/**
 * Fetches all rejected separation items
 */
export const fetchRejectedSeparationItems = async () => {
  try {
    const { data, error } = await supabase
      .from('separacoes')
      .select(`
        id,
        cliente_nome,
        status,
        created_at,
        updated_at,
        separacao_itens(*)
      `)
      .eq('status', 'reprovado');

    if (error) {
      console.error('Erro ao buscar itens reprovados:', error);
      return [];
    }

    // Extrair todos os itens das separações reprovadas
    const rejectedItems: any[] = [];
    data.forEach(separacao => {
      if (separacao.separacao_itens && separacao.separacao_itens.length > 0) {
        separacao.separacao_itens.forEach((item: any) => {
          rejectedItems.push({
            ...item,
            cliente_nome: separacao.cliente_nome,
            separacao_status: separacao.status,
            separacao_id: separacao.id,
            separacao_data: separacao.created_at
          });
        });
      }
    });

    return rejectedItems;
  } catch (error) {
    console.error('Erro ao buscar itens reprovados:', error);
    return [];
  }
};

