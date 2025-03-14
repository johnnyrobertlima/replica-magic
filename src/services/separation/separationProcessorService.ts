
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

  // Group items by PES_CODIGO (client code) instead of by client name
  // This ensures we get one separation per client, not per client name
  const itemsByClient: Record<string, typeof allSelectedItems> = {};
  
  allSelectedItems.forEach(item => {
    // Use the client code as the key instead of the name
    const clientKey = item.PES_CODIGO ? `client_${item.PES_CODIGO}` : "sem_codigo";
    
    if (!itemsByClient[clientKey]) {
      itemsByClient[clientKey] = [];
    }
    itemsByClient[clientKey].push(item);
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

  for (const [clientKey, items] of Object.entries(itemsByClient)) {
    if (items.length === 0) continue;
    
    // All items in this group should have the same client code/name
    const clientItem = items[0];
    const clienteCode = clientItem.PES_CODIGO;
    const clientName = clientItem.APELIDO || "Cliente Sem Nome";

    console.log(`Processando cliente: ${clientName} (código: ${clienteCode})`);
    
    if (!clienteCode) {
      console.error(`Cliente ${clientName} sem código válido:`, clientItem);
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
