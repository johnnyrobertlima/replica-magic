
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

  // Função para carregar os grupos (executada apenas uma vez)
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

  // Função para carregar os itens com paginação
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
      
      // Registramos apenas uma vez por carregamento bem-sucedido
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

  // Nova função para carregar todos os itens (sem paginação)
  const loadAllItems = useCallback(async () => {
    try {
      setIsLoadingAll(true);
      toast({
        title: "Carregando todos os itens",
        description: "Esta operação pode levar alguns minutos para grandes volumes de dados.",
      });
      
      const allItems = await fetchAllItems(searchTerm, groupFilter);
      
      setItems(allItems);
      setTotalCount(allItems.length);
      pagination.updateTotalCount(allItems.length);
      
      toast({
        title: "Carregamento completo",
        description: `Foram carregados ${allItems.length} itens no total.`,
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

  // Carregamento inicial dos grupos (apenas uma vez)
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Efeito para carregar itens apenas quando necessário
  useEffect(() => {
    // Verificamos se é a primeira renderização
    if (isFirstRender.current) {
      isFirstRender.current = false;
      loadItems();
      return;
    }
    
    // Verificamos se os filtros ou a página mudaram
    const filtersChanged = 
      previousSearchTerm.current !== searchTerm || 
      previousGroupFilter.current !== groupFilter;
    
    const pageChanged = previousPage.current !== pagination.currentPage;
    
    // Atualizamos os valores anteriores
    previousSearchTerm.current = searchTerm;
    previousGroupFilter.current = groupFilter;
    previousPage.current = pagination.currentPage;
    
    // Se os filtros mudaram, resetamos para a primeira página
    if (filtersChanged) {
      pagination.goToPage(1);
      return; // O efeito de mudança de página irá carregar os itens
    }
    
    // Se a página mudou, carregamos os novos itens
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
