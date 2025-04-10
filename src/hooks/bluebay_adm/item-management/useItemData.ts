
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PaginationState } from "@/hooks/bluebay/hooks/usePagination";

export const useItemData = (pagination: PaginationState) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const fetchItems = useCallback(async (searchTerm: string, groupFilter: string) => {
    setIsLoading(true);
    try {
      // Calculate range based on current page and page size
      const from = (pagination.currentPage - 1) * pagination.pageSize;
      const to = from + pagination.pageSize - 1;
      
      // Build our query
      let query = supabase
        .from("BLUEBAY_ITEM")
        .select("*", { count: "exact" })
        .order("DESCRICAO")
        .range(from, to);

      // Apply filters
      if (searchTerm) {
        query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
      }

      if (groupFilter && groupFilter !== "all") {
        query = query.eq("GRU_CODIGO", groupFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      // Filter out any duplicate items by ITEM_CODIGO
      const uniqueItems = data?.filter((item, index, self) => 
        index === self.findIndex(i => i.ITEM_CODIGO === item.ITEM_CODIGO)
      ) || [];
      
      setItems(uniqueItems);
      
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
  }, [pagination, toast]);

  return {
    items,
    isLoading,
    totalCount,
    fetchItems,
  };
};
