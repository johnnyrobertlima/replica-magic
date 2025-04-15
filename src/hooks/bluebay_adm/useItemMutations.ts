
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { saveItem, deleteItem } from "@/services/bluebay_adm/itemManagementService";

export const useItemMutations = (onSuccess: () => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveItem = async (itemData: any, isUpdate: boolean = false) => {
    try {
      setIsLoading(true);
      const result = await saveItem(itemData, isUpdate);
      
      toast({
        title: isUpdate ? "Item atualizado" : "Item cadastrado",
        description: result.message,
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Error saving item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar item",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (item: any) => {
    try {
      setIsLoading(true);
      const result = await deleteItem(item.ITEM_CODIGO);
      
      toast({
        title: "Item excluído",
        description: result.message,
      });
      
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir item",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSaveItem,
    handleDeleteItem
  };
};
