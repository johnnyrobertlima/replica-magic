
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { usePagination } from "@/hooks/bluebay/hooks/usePagination";

export const useItemManagement = () => {
  const [items, setItems] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();
  
  // Use pagination hook to manage pagination state
  const pagination = usePagination(100); // 100 items per page

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Calculate range based on current page and page size
      const from = (pagination.currentPage - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      
      let query = supabase
        .from("BLUEBAY_ITEM")
        .select("*", { count: "exact" })
        .order("DESCRICAO")
        .range(from, to);

      if (searchTerm) {
        query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
      }

      if (groupFilter && groupFilter !== "all") {
        query = query.eq("GRU_CODIGO", groupFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      setItems(data || []);
      
      // Update total count and pagination
      if (count !== null) {
        setTotalCount(count);
        pagination.updateTotalCount(count);
      }
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
  }, [searchTerm, groupFilter, pagination.currentPage, pagination.pageSize, toast, pagination.updateTotalCount]);

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
      pagination.goToPage(1); // Reset to first page on search
      fetchItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, groupFilter, fetchItems, pagination]);

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
    pagination,
    totalCount,
  };
};
