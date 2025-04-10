
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useItemOperations = (refreshItems: () => void) => {
  const { toast } = useToast();

  const handleSaveItem = useCallback(async (itemData: any, isUpdate: boolean) => {
    try {
      if (isUpdate) {
        // For updates, we need the primary key (ITEM_CODIGO)
        const { error } = await supabase
          .from("BLUEBAY_ITEM")
          .update({
            DESCRICAO: itemData.DESCRICAO,
            GRU_CODIGO: itemData.GRU_CODIGO,
            GRU_DESCRICAO: itemData.GRU_DESCRICAO,
            CODIGOAUX: itemData.CODIGOAUX,
          })
          .eq("ITEM_CODIGO", itemData.ITEM_CODIGO);

        if (error) throw error;

        toast({
          title: "Item atualizado",
          description: "O item foi atualizado com sucesso.",
        });
      } else {
        // For new items, include current date
        const { error } = await supabase
          .from("BLUEBAY_ITEM")
          .insert({
            ITEM_CODIGO: itemData.ITEM_CODIGO,
            DESCRICAO: itemData.DESCRICAO,
            GRU_CODIGO: itemData.GRU_CODIGO,
            GRU_DESCRICAO: itemData.GRU_DESCRICAO,
            CODIGOAUX: itemData.CODIGOAUX,
            DATACADASTRO: new Date().toISOString(),
            MATRIZ: 1, // Default values
            FILIAL: 1, // Default values
          });

        if (error) throw error;

        toast({
          title: "Item cadastrado",
          description: "O item foi cadastrado com sucesso.",
        });
      }

      // Refresh the item list
      refreshItems();
      // Return void instead of boolean
    } catch (error: any) {
      console.error("Error saving item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar item",
        description: error.message,
      });
    }
  }, [toast, refreshItems]);

  const handleDeleteItem = useCallback(async (item: any) => {
    try {
      const { error } = await supabase
        .from("BLUEBAY_ITEM")
        .delete()
        .eq("ITEM_CODIGO", item.ITEM_CODIGO);

      if (error) throw error;

      toast({
        title: "Item excluído",
        description: "O item foi excluído com sucesso.",
      });

      // Refresh the item list
      refreshItems();
      // Return void instead of boolean
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir item",
        description: error.message,
      });
    }
  }, [toast, refreshItems]);

  return {
    handleSaveItem,
    handleDeleteItem,
  };
};
