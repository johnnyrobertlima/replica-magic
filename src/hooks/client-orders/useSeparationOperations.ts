
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { sendToSeparation } from "@/services/clientSeparationService";
import type { ClientOrdersState } from "@/types/clientOrders";

export const useSeparationOperations = (
  state: ClientOrdersState,
  setState: (state: ClientOrdersState | ((prev: ClientOrdersState) => ClientOrdersState)) => void,
  groups: Record<string, any>
) => {
  const [error, setError] = useState<string | null>(null);

  // Mutation to send items to separation
  const sendToSeparationMutation = useMutation({
    mutationFn: (params: { selectedItems: string[], selectedItemsDetails: Record<string, any> }) => {
      console.log("Mutation function called with params:", params);
      
      // Add better debugging for the items being sent
      const itemsToSend = params.selectedItems.map(item => {
        const details = params.selectedItemsDetails[item];
        console.log(`Processing item ${item} with details:`, details);
        
        return {
          itemCodigo: item,
          pedido: details.pedido || "", // Garantir que o pedido seja enviado
          pesCodigo: details.clientCode || details.PES_CODIGO || 0,
          descricao: details.DESCRICAO || "",
          qtdeSaldo: details.qtde || 0,
          valorUnitario: details.valor / details.qtde || 0
        };
      });
      
      console.log("Prepared items for separation:", itemsToSend);
      
      return sendToSeparation({
        items: itemsToSend
      });
    },
    onSuccess: (data, variables) => {
      const itemCount = variables.selectedItems.length;
      toast.success(`${itemCount} ${itemCount === 1 ? 'item foi enviado' : 'itens foram enviados'} para separação com sucesso!`);
      
      // Reset selected items
      setState((prev) => ({
        ...prev,
        selectedItems: [],
        selectedItemsDetails: {},
        isSending: false
      }));
    },
    onError: (err: any) => {
      console.error("Error in separation mutation:", err);
      const errorMessage = err?.message || 'Falha ao enviar itens para separação';
      toast.error(errorMessage);
      setError(errorMessage);
      setState((prev) => ({ ...prev, isSending: false }));
    }
  });

  const handleEnviarParaSeparacao = () => {
    if (state.selectedItems.length === 0) {
      toast.warning('Selecione pelo menos um item para enviar para separação');
      return;
    }

    console.log("Handling enviar para separação with state:", state);
    setState((prev) => ({ ...prev, isSending: true }));

    // Extract details for selected items
    const selectedItemsDetails: Record<string, any> = {};
    
    state.selectedItems.forEach(itemCode => {
      // First try to get from state.selectedItemsDetails if available
      if (state.selectedItemsDetails[itemCode]) {
        selectedItemsDetails[itemCode] = {
          ...state.selectedItemsDetails[itemCode]
        };
        
        // Find additional details from groups if needed
        for (const group of Object.values(groups)) {
          for (const item of group.allItems || []) {
            if (item.ITEM_CODIGO === itemCode) {
              selectedItemsDetails[itemCode] = {
                ...selectedItemsDetails[itemCode],
                pedido: item.pedido || selectedItemsDetails[itemCode].pedido,
                DESCRICAO: item.DESCRICAO,
                PES_CODIGO: item.PES_CODIGO
              };
              break;
            }
          }
        }
      } else {
        // Fall back to searching in groups if not in state
        for (const group of Object.values(groups)) {
          for (const item of group.allItems || []) {
            if (item.ITEM_CODIGO === itemCode) {
              selectedItemsDetails[itemCode] = {
                qtde: item.QTDE_SALDO,
                valor: item.QTDE_SALDO * item.VALOR_UNITARIO,
                pedido: item.pedido, // Importante capturar o pedido
                DESCRICAO: item.DESCRICAO,
                PES_CODIGO: item.PES_CODIGO
              };
              break;
            }
          }
        }
      }
    });

    console.log("Selected items details:", selectedItemsDetails);

    sendToSeparationMutation.mutate({
      selectedItems: state.selectedItems,
      selectedItemsDetails
    });
  };

  return {
    handleEnviarParaSeparacao,
    error,
    isError: !!error
  };
};
