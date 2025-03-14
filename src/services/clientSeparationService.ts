
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getClientCodeFromItem } from "@/utils/selectionUtils";
import type { ClientOrderGroup } from "@/types/clientOrders";

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

export const sendOrdersForSeparation = async (
  selectedItems: string[],
  groupedOrders: Record<string, ClientOrderGroup>,
  showToast = true
) => {
  if (selectedItems.length === 0) {
    if (showToast) {
      toast({
        title: "Aviso",
        description: "Selecione pelo menos um item para enviar para separação",
        variant: "default",
      });
    }
    return { success: false, message: "Nenhum item selecionado" };
  }

  try {
    let allSelectedItems: Array<{
      pedido: string;
      item: any;
      PES_CODIGO: number | null;
      APELIDO: string | null;
    }> = [];

    Object.values(groupedOrders).forEach(group => {
      group.allItems.forEach(item => {
        if (selectedItems.includes(item.ITEM_CODIGO)) {
          const pesCodigoNumerico = getClientCodeFromItem(item);
          
          console.log('PES_CODIGO original:', item.PES_CODIGO);
          console.log('PES_CODIGO processado:', pesCodigoNumerico);

          allSelectedItems.push({
            pedido: item.pedido,
            item: item,
            PES_CODIGO: pesCodigoNumerico,
            APELIDO: item.APELIDO
          });
        }
      });
    });

    const itemsByClient: Record<string, typeof allSelectedItems> = {};
    
    allSelectedItems.forEach(item => {
      const clientName = item.APELIDO || "Sem Cliente";
      if (!itemsByClient[clientName]) {
        itemsByClient[clientName] = [];
      }
      itemsByClient[clientName].push(item);
    });

    let successCount = 0;
    for (const [clientName, items] of Object.entries(itemsByClient)) {
      console.log(`Processando cliente: ${clientName}`);
      
      const clientItem = items.find(item => item.PES_CODIGO !== null);
      const clienteCode = clientItem?.PES_CODIGO;

      if (!clienteCode) {
        console.error(`Cliente ${clientName} sem código válido:`, items[0]);
        if (showToast) {
          toast({
            title: "Erro",
            description: `Cliente ${clientName} não possui código válido`,
            variant: "destructive",
          });
        }
        continue;
      }

      const valorTotal = items.reduce((sum, item) => 
        sum + (item.item.QTDE_SALDO * item.item.VALOR_UNITARIO), 0
      );

      try {
        const separacao = await createSeparation(clientName, clienteCode, items, valorTotal);
        await createSeparationItems(separacao.id, items);
        successCount++;
      } catch (error) {
        console.error(`Erro ao processar cliente ${clientName}:`, error);
        if (showToast) {
          toast({
            title: "Erro",
            description: error instanceof Error ? error.message : `Erro ao processar cliente ${clientName}`,
            variant: "destructive",
          });
        }
      }
    }

    if (successCount > 0) {
      console.log(`Sucesso! ${successCount} separações criadas`);
      if (showToast) {
        toast({
          title: "Sucesso",
          description: `${successCount} separação(ões) criada(s) com sucesso!`,
          variant: "default",
        });
      }
      return { success: true, count: successCount };
    } else {
      if (showToast) {
        toast({
          title: "Aviso",
          description: "Nenhuma separação foi criada",
          variant: "default",
        });
      }
      return { success: false, message: "Nenhuma separação foi criada" };
    }
  } catch (error) {
    console.error('Erro ao processar separação:', error);
    if (showToast) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar os itens para separação",
        variant: "destructive",
      });
    }
    return { success: false, error };
  }
};
