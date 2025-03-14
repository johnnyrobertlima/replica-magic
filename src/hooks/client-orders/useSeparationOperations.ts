
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
        // Invalidate queries to refresh data
        await queryClient.invalidateQueries({ queryKey: ['separacoes'] });
        await queryClient.invalidateQueries({ queryKey: ['jabOrders'] });
        
        console.log('Clearing selection state after successful separation');
        
        // Reset selection state to ensure no checkboxes remain selected
        // Explicitly set these values to ensure UI updates
        setState(prev => ({ 
          ...prev, 
          selectedItems: [],
          selectedItemsDetails: {},
          expandedClients: new Set()
        }));

        toast({
          title: "Separação concluída",
          description: `${result.count || 0} separação(ões) criada(s) com sucesso!`,
        });
      } else {
        console.error('Separation failed:', result.message);
      }
    } catch (error) {
      console.error('Error in handleEnviarParaSeparacao:', error);
    } finally {
      setState(prev => ({ ...prev, isSending: false }));
    }
  };

  return {
    handleEnviarParaSeparacao
  };
};
