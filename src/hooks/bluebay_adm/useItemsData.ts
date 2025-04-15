
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchItems, fetchGroups } from "@/services/bluebay_adm/itemManagementService";

export const useItemsData = (
  searchTerm: string,
  groupFilter: string,
  pagination: any
) => {
  const [items, setItems] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { items: fetchedItems, count } = await fetchItems(
        searchTerm,
        groupFilter,
        pagination.currentPage,
        pagination.pageSize
      );
      
      setItems(fetchedItems);
      setTotalCount(count);
      pagination.updateTotalCount(count);
    } catch (error: any) {
      console.error("Error fetching items:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar itens",
        description: error.message,
      });
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, groupFilter, pagination, toast]);

  const loadGroups = useCallback(async () => {
    try {
      const fetchedGroups = await fetchGroups();
      setGroups(fetchedGroups);
    } catch (error: any) {
      console.error("Error fetching groups:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar grupos",
        description: error.message,
      });
    }
  }, [toast]);

  // Initial loading of groups
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Fetch items with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadItems]);

  // Reset to first page when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      pagination.goToPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, groupFilter, pagination]);

  return {
    items,
    groups,
    isLoading,
    totalCount,
    refreshItems: loadItems
  };
};
