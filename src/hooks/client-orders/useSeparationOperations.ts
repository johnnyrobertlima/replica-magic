
import { useQueryClient } from "@tanstack/react-query";
import { sendOrdersForSeparation } from "@/services/clientSeparationService";
import type { ClientOrdersState } from "@/types/clientOrders";
import { useToast } from "@/hooks/use-toast";

export const useSeparationOperations = (
  state: ClientOrdersState,
  setState: React.Dispatch<React.SetStateAction<ClientOrdersState>>,
  groupedOrders: Record<string, any>
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedItems } = state;

  const handleEnviarParaSeparacao = async () => {
    setState(prev => ({ ...prev, isSending: true }));
    
    try {
      const result = await sendOrdersForSeparation(selectedItems, groupedOrders);
      
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['separacoes'] });
        await queryClient.invalidateQueries({ queryKey: ['jabOrders'] });
        
        // Clear selections automatically after successful separation
        setState(prev => ({ 
          ...prev, 
          selectedItems: [],
          selectedItemsDetails: {},
        }));

        toast({
          title: "Separação concluída",
          description: `${result.count || 0} separação(ões) criada(s) com sucesso!`,
        });

        // Don't need to reset expandedClients here as it was causing issues
      }
    } finally {
      setState(prev => ({ ...prev, isSending: false }));
    }
  };

  return {
    handleEnviarParaSeparacao
  };
};
