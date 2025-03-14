
import { getClientCodeFromItem } from "@/utils/selectionUtils";
import type { ClientOrderGroup } from "@/types/clientOrders";
import { createSeparation, createSeparationItems } from "./separationDbService";

/**
 * Processes the selected items and groups them by client
 */
export const processSelectedItems = (
  selectedItems: string[],
  groupedOrders: Record<string, ClientOrderGroup>,
  selectedItemsDetails?: Record<string, { qtde: number; valor: number; clientName?: string; clientCode?: number }>
) => {
  if (selectedItems.length === 0) {
    return { success: false, message: "Nenhum item selecionado", items: [] };
  }

  let allSelectedItems: Array<{
    pedido: string;
    item: any;
    PES_CODIGO: number | null;
    APELIDO: string | null;
    clientCardName?: string; // Novo campo para o nome do cliente do card
  }> = [];

  // Coletar informações sobre os clientes que contêm os itens selecionados
  const clientsForItems: Record<string, { clientName: string; PES_CODIGO: number }> = {};
  
  // Primeiro identifica a qual cliente cada item pertence (do card de onde foi selecionado)
  if (selectedItemsDetails) {
    Object.entries(selectedItemsDetails).forEach(([itemCode, details]) => {
      if (details.clientName && details.clientCode) {
        clientsForItems[itemCode] = {
          clientName: details.clientName,
          PES_CODIGO: details.clientCode
        };
      }
    });
  }

  // Agora coleta apenas os itens correspondentes ao cliente apropriado
  Object.entries(groupedOrders).forEach(([clientName, group]) => {
    group.allItems.forEach(item => {
      if (selectedItems.includes(item.ITEM_CODIGO)) {
        const itemClient = clientsForItems[item.ITEM_CODIGO];
        
        // Se temos informações do cliente para esse item e ele pertence a este cliente
        if (itemClient && itemClient.clientName === clientName) {
          const pesCodigoNumerico = getClientCodeFromItem(item);
          
          console.log('PES_CODIGO original:', item.PES_CODIGO);
          console.log('PES_CODIGO processado:', pesCodigoNumerico);

          allSelectedItems.push({
            pedido: item.pedido,
            item: item,
            PES_CODIGO: pesCodigoNumerico,
            APELIDO: item.APELIDO,
            clientCardName: clientName
          });
        }
        // Se não temos informações de cliente para este item (retrocompatibilidade)
        else if (!itemClient) {
          const pesCodigoNumerico = getClientCodeFromItem(item);
          
          console.log('PES_CODIGO original:', item.PES_CODIGO);
          console.log('PES_CODIGO processado:', pesCodigoNumerico);

          allSelectedItems.push({
            pedido: item.pedido,
            item: item,
            PES_CODIGO: pesCodigoNumerico,
            APELIDO: item.APELIDO,
            clientCardName: clientName
          });
        }
      }
    });
  });

  // Group items by PES_CODIGO (client code) and clientCardName
  const itemsByClient: Record<string, typeof allSelectedItems> = {};
  
  allSelectedItems.forEach(item => {
    // Use a consistent key format based on client code AND card name
    const clientKey = item.clientCardName 
      ? `client_${item.PES_CODIGO}_${item.clientCardName}`
      : `client_${item.PES_CODIGO}`;
    
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
    clientCardName?: string;
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
