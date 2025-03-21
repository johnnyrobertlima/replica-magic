
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
      return sendToSeparation({
        items: params.selectedItems.map(item => {
          const details = params.selectedItemsDetails[item];
          return {
            itemCodigo: item,
            pedido: details.pedido,
            pesCodigo: details.PES_CODIGO || details.pes_codigo,
            descricao: details.DESCRICAO,
            qtdeSaldo: details.QTDE_SALDO,
            valorUnitario: details.VALOR_UNITARIO
          };
        })
      });
    },
    onSuccess: () => {
      toast.success('Itens enviados para separação com sucesso!');
      // Reset selected items
      setState((prev) => ({
        ...prev,
        selectedItems: [],
        selectedItemsDetails: {},
        isSending: false
      }));
    },
    onError: (err: any) => {
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

    setState((prev) => ({ ...prev, isSending: true }));

    // Extract details for selected items
    const selectedItemsDetails: Record<string, any> = {};
    state.selectedItems.forEach(itemCode => {
      for (const group of Object.values(groups)) {
        for (const item of group.allItems) {
          if (item.ITEM_CODIGO === itemCode) {
            selectedItemsDetails[itemCode] = item;
            break;
          }
        }
      }
    });

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
