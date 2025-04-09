
import { getClientCodeFromItem } from "@/utils/selectionUtils";
import type { ClientOrderGroup } from "@/types/clientOrders";
import { createSeparation, createSeparationItems } from "./separationDbService";

/**
 * Processes the selected items and groups them by client
 */
export const processSelectedItems = (
  selectedItems: string[],
  groupedOrders: Record<string, ClientOrderGroup>,
  selectedItemsDetails?: Record<string, { 
    qtde: number; 
    valor: number; 
    clientName?: string; 
    clientCode?: number;
    pedido?: string;  // Número do pedido associado ao item
    DESCRICAO?: string | null;
    PES_CODIGO?: number;
  }>
) => {
  if (selectedItems.length === 0) {
    return { success: false, message: "Nenhum item selecionado", items: [] };
  }

  let allSelectedItems: Array<{
    pedido: string;
    item: any;
    PES_CODIGO: number | null;
    APELIDO: string | null;
    clientCardName?: string; // Nome do cliente do card
  }> = [];

  // Coletar informações sobre os clientes que contêm os itens selecionados
  const clientsForItems: Record<string, { 
    clientName: string; 
    PES_CODIGO: number;
    pedido?: string; // Adicionado para rastrear o pedido de cada item
  }> = {};
  
  // Primeiro identifica a qual cliente cada item pertence (do card de onde foi selecionado)
  // e também armazena o número do pedido associado
  if (selectedItemsDetails) {
    Object.entries(selectedItemsDetails).forEach(([itemCode, details]) => {
      if (details.clientName && details.clientCode) {
        clientsForItems[itemCode] = {
          clientName: details.clientName,
          PES_CODIGO: details.clientCode,
          pedido: details.pedido // Capturar o número do pedido original dos detalhes
        };
        console.log(`Item ${itemCode} associado ao cliente ${details.clientName} e pedido original ${details.pedido || 'Não informado'}`);
      }
    });
  }

  // Agora coleta apenas os itens correspondentes ao cliente apropriado
  // incluindo explicitamente o número do pedido original
  Object.entries(groupedOrders).forEach(([clientName, group]) => {
    group.allItems.forEach(item => {
      if (selectedItems.includes(item.ITEM_CODIGO)) {
        const itemClient = clientsForItems[item.ITEM_CODIGO];
        
        // Se temos informações do cliente para esse item e ele pertence a este cliente
        if (itemClient && itemClient.clientName === clientName) {
          const pesCodigoNumerico = getClientCodeFromItem(item);
          
          console.log('PES_CODIGO original:', item.PES_CODIGO);
          console.log('PES_CODIGO processado:', pesCodigoNumerico);
          
          // Priorizar o pedido armazenado nos detalhes do item (que vem da seleção original)
          // Em vez de usar o pedido do item atual
          const pedidoOriginal = itemClient.pedido || item.pedido || '';
          console.log('Pedido original para usar:', pedidoOriginal);

          allSelectedItems.push({
            pedido: pedidoOriginal, // Usar o pedido original capturado na seleção
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
          console.log('Pedido do item:', item.pedido || '');

          allSelectedItems.push({
            pedido: item.pedido || '', // Usar o pedido do item como fallback
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
    console.log(`Itens para separação com pedidos originais:`, items.map(i => ({
      item_codigo: i.item.ITEM_CODIGO,
      pedido: i.pedido, // Pedido original preservado
      descricao: i.item.DESCRICAO
    })));
    
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
