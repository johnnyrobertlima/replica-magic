
import { getClientCodeFromItem } from "@/utils/selectionUtils";
import type { ClientOrderGroup } from "@/types/clientOrders";
import { createSeparation, createSeparationItems } from "./separationDbService";

/**
 * Processes the selected items and groups them by client
 */
export const processSelectedItems = (
  selectedItems: string[],
  groupedOrders: Record<string, ClientOrderGroup>
) => {
  if (selectedItems.length === 0) {
    return { success: false, message: "Nenhum item selecionado", items: [] };
  }

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

  return { 
    success: true, 
    items: allSelectedItems, 
    itemsByClient 
  };
};

/**
 * Creates separation records for each client
 */
export const createSeparationsForClients = async (
  itemsByClient: Record<string, Array<{
    pedido: string;
    item: any;
    PES_CODIGO: number | null;
    APELIDO: string | null;
  }>>
) => {
  let successCount = 0;
  let errors: Array<{ client: string, message: string }> = [];

  for (const [clientName, items] of Object.entries(itemsByClient)) {
    console.log(`Processando cliente: ${clientName}`);
    
    const clientItem = items.find(item => item.PES_CODIGO !== null);
    const clienteCode = clientItem?.PES_CODIGO;

    if (!clienteCode) {
      console.error(`Cliente ${clientName} sem código válido:`, items[0]);
      errors.push({
        client: clientName,
        message: `Cliente ${clientName} não possui código válido`
      });
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
      errors.push({
        client: clientName,
        message: error instanceof Error ? error.message : `Erro ao processar cliente ${clientName}`
      });
    }
  }

  return { successCount, errors };
};
