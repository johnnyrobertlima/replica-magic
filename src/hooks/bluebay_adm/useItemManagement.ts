
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useItemManagement = () => {
  const [items, setItems] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("BLUEBAY_ITEM")
        .select("*")
        .order("DESCRICAO");

      if (searchTerm) {
        query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
      }

      if (groupFilter) {
        query = query.eq("GRU_CODIGO", groupFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar itens",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, groupFilter, toast]);

  const fetchGroups = useCallback(async () => {
    try {
      // Get unique groups from items
      const { data, error } = await supabase
        .from("BLUEBAY_ITEM")
        .select("GRU_CODIGO, GRU_DESCRICAO")
        .not("GRU_CODIGO", "is", null)
        .order("GRU_DESCRICAO");

      if (error) throw error;

      // Remove duplicates
      const uniqueGroups = data?.reduce((acc: any[], curr) => {
        if (!acc.some(group => group.GRU_CODIGO === curr.GRU_CODIGO) && curr.GRU_CODIGO) {
          acc.push(curr);
        }
        return acc;
      }, []);

      setGroups(uniqueGroups || []);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar grupos",
        description: error.message,
      });
    }
  }, [toast]);

  const handleSaveItem = async (itemData: any) => {
    try {
      // Check if it's an update or insert
      const isUpdate = !!selectedItem;

      // For updates, we need the primary key (ITEM_CODIGO)
      if (isUpdate) {
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

      // Reset form and refresh list
      setSelectedItem(null);
      setIsDialogOpen(false);
      fetchItems();
    } catch (error: any) {
      console.error("Error saving item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar item",
        description: error.message,
      });
    }
  };

  const handleDeleteItem = async (item: any) => {
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

      fetchItems();
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir item",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Add debounce for search term
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, groupFilter, fetchItems]);

  return {
    items,
    isLoading,
    searchTerm,
    setSearchTerm,
    groupFilter,
    setGroupFilter,
    groups,
    selectedItem,
    setSelectedItem,
    isDialogOpen,
    setIsDialogOpen,
    handleSaveItem,
    handleDeleteItem,
    fetchItems,
  };
};
