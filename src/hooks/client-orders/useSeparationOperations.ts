
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { createSeparacao } from "@/services/clientSeparationService";

export function useSeparationOperations(state: any, setState: any, clientGroups: Record<string, any>) {
  const navigate = useNavigate();

  const handleEnviarParaSeparacao = async (displayName?: string) => {
    try {
      setState(prev => ({ ...prev, isSending: true }));

      // Get the details of selected items
      const selectedItemsDetails: Record<string, { qtde: number; valor: number }> = {};

      Object.entries(state.selectedItems).forEach(([key]) => {
        const [pedido, itemCodigo] = key.split(':');
        
        // Find the item in the client groups
        for (const groupData of Object.values(clientGroups)) {
          const foundItem = groupData.allItems.find((item: any) => 
            item.ITEM_CODIGO === itemCodigo && item.pedido === pedido
          );
          
          if (foundItem) {
            selectedItemsDetails[key] = {
              qtde: foundItem.QTDE_SALDO,
              valor: foundItem.VALOR_UNITARIO
            };
            break;
          }
        }
      });

      // Send the orders for separation
      const result = await createSeparacao(selectedItemsDetails, clientGroups, displayName);

      if (result) {
        toast({
          title: "Separação criada com sucesso",
          description: "Os itens foram enviados para separação.",
          variant: "default"
        });

        // Clear selection
        setState(prev => ({ ...prev, selectedItems: {} }));

        // Navigate to separation details
        navigate(`/client-area/bluebay/separacoes/${result.id}`);
      }
    } catch (error) {
      console.error("Erro ao enviar para separação:", error);
      toast({
        title: "Erro ao enviar para separação",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setState(prev => ({ ...prev, isSending: false }));
    }
  };

  return {
    handleEnviarParaSeparacao
  };
}
