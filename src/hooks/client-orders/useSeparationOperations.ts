
import { useQueryClient } from "@tanstack/react-query";
import { sendOrdersForSeparation } from "@/services/clientSeparationService";
import type { ClientOrdersState } from "@/types/clientOrders";

export const useSeparationOperations = (
  state: ClientOrdersState,
  setState: React.Dispatch<React.SetStateAction<ClientOrdersState>>,
  groupedOrders: Record<string, any>
) => {
  const queryClient = useQueryClient();
  const { selectedItems } = state;

  const handleEnviarParaSeparacao = async () => {
    setState(prev => ({ ...prev, isSending: true }));
    
    try {
      const result = await sendOrdersForSeparation(selectedItems, groupedOrders);
      
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['separacoes'] });
        await queryClient.invalidateQueries({ queryKey: ['jabOrders'] });
        
        setState(prev => ({ 
          ...prev, 
          selectedItems: [],
          selectedItemsDetails: {},
          expandedClients: new Set()
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isSending: false }));
    }
  };

  return {
    handleEnviarParaSeparacao
  };
};
