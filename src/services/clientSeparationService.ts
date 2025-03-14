
import { useToast } from "@/hooks/use-toast";
import type { ClientOrderGroup } from "@/types/clientOrders";
import { processSelectedItems, createSeparationsForClients } from "./separation/separationProcessorService";

/**
 * Main function to send orders for separation
 */
export const sendOrdersForSeparation = async (
  selectedItems: string[],
  groupedOrders: Record<string, ClientOrderGroup>,
  showToast = true
) => {
  const { toast } = useToast();
  
  if (selectedItems.length === 0) {
    if (showToast) {
      toast({
        title: "Aviso",
        description: "Selecione pelo menos um item para enviar para separação",
        variant: "default",
      });
    }
    return { success: false, message: "Nenhum item selecionado" };
  }

  try {
    console.log('Processing selected items:', selectedItems.length);
    
    // Process and group the selected items by client
    const { success, message, itemsByClient } = processSelectedItems(selectedItems, groupedOrders);
    
    if (!success || !itemsByClient) {
      if (showToast) {
        toast({
          title: "Aviso",
          description: message || "Erro ao processar itens",
          variant: "default",
        });
      }
      return { success: false, message };
    }

    // Create separations for each client
    const { successCount, errors } = await createSeparationsForClients(itemsByClient);

    // Handle the results
    if (successCount > 0) {
      console.log(`Sucesso! ${successCount} separações criadas`);
      
      // Don't show toast here, we'll handle it in the hook
      if (showToast && false) {
        toast({
          title: "Sucesso",
          description: `${successCount} separação(ões) criada(s) com sucesso!`,
          variant: "default",
        });
      }
      
      // Show errors for any failed clients
      errors.forEach(error => {
        if (showToast) {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive",
          });
        }
      });
      
      return { success: true, count: successCount };
    } else {
      if (showToast) {
        toast({
          title: "Aviso",
          description: "Nenhuma separação foi criada",
          variant: "default",
        });
      }
      return { success: false, message: "Nenhuma separação foi criada" };
    }
  } catch (error) {
    console.error('Erro ao processar separação:', error);
    if (showToast) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar os itens para separação",
        variant: "destructive",
      });
    }
    return { success: false, error };
  }
};
