
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchItems, fetchGroups, fetchAllItems } from "@/services/bluebay_adm/itemManagementService";

export const useItemsData = (
  searchTerm: string,
  groupFilter: string,
  pagination: any
) => {
  const [items, setItems] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const { toast } = useToast();
  const isFirstRender = useRef(true);
  const previousSearchTerm = useRef(searchTerm);
  const previousGroupFilter = useRef(groupFilter);
  const previousPage = useRef(pagination.currentPage);

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
      
      console.info(`Loaded ${fetchedItems.length} items (page ${pagination.currentPage} of ${Math.ceil(count/pagination.pageSize)})`);
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

  const loadAllItems = useCallback(async () => {
    try {
      setIsLoadingAll(true);
      setItems([]); // Limpar itens atuais para evitar duplicação com os novos resultados
      
      toast({
        title: "Carregando todos os itens",
        description: "Esta operação pode levar alguns minutos para grandes volumes de dados.",
        variant: "default"
      });
      
      console.log("Iniciando carregamento de todos os itens...");
      
      // Usamos await para garantir que todos os itens sejam carregados antes de atualizar o estado
      const allItems = await fetchAllItems(searchTerm, groupFilter);
      console.log(`Total final de itens carregados: ${allItems.length}`);
      
      // Atualiza o estado com todos os itens carregados
      setItems(allItems);
      setTotalCount(allItems.length);
      pagination.updateTotalCount(allItems.length);
      
      toast({
        title: "Carregamento completo",
        description: `Foram carregados ${allItems.length} itens no total.`,
        variant: "default"
      });
      
      console.info(`Loaded all ${allItems.length} items without pagination`);
    } catch (error: any) {
      console.error("Error fetching all items:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar todos os itens",
        description: error.message,
      });
    } finally {
      setIsLoadingAll(false);
    }
  }, [searchTerm, groupFilter, pagination, toast]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      loadItems();
      return;
    }
    
    const filtersChanged = 
      previousSearchTerm.current !== searchTerm || 
      previousGroupFilter.current !== groupFilter;
    
    const pageChanged = previousPage.current !== pagination.currentPage;
    
    previousSearchTerm.current = searchTerm;
    previousGroupFilter.current = groupFilter;
    previousPage.current = pagination.currentPage;
    
    if (filtersChanged) {
      pagination.goToPage(1);
      return;
    }
    
    if (pageChanged) {
      loadItems();
    }
  }, [searchTerm, groupFilter, pagination.currentPage, loadItems, pagination]);

  return {
    items,
    groups,
    isLoading,
    isLoadingAll,
    totalCount,
    refreshItems: loadItems,
    loadAllItems
  };
};
