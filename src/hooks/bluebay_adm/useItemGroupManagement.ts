
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchGroups, fetchEmpresas, saveGroup } from "@/services/bluebay_adm/itemGroupService";

export const useItemGroupManagement = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Loading data for item group management...");
      
      // Load data concurrently
      const [fetchedGroups, fetchedEmpresas] = await Promise.all([
        fetchGroups(),
        fetchEmpresas()
      ]);
      
      console.log(`Loaded ${fetchedGroups.length} groups`);
      setGroups(fetchedGroups);
      setEmpresas(fetchedEmpresas);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: error.message || "Ocorreu um erro desconhecido",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveGroup = useCallback(async (groupData: any) => {
    try {
      setIsLoading(true);
      await saveGroup(groupData);
      
      // Optimistic UI update for better responsiveness
      if (groupData.GRU_CODIGO) {
        // Updating existing group
        setGroups(prevGroups => 
          prevGroups.map(g => 
            g.GRU_CODIGO === groupData.GRU_CODIGO ? groupData : g
          )
        );
        
        toast({
          title: "Sucesso",
          description: "Grupo atualizado com sucesso!",
        });
      } else {
        // For new groups, append with a temporary ID until refresh
        const tempNewGroup = {
          ...groupData,
          GRU_CODIGO: groupData.GRU_CODIGO || `temp-${Date.now()}`
        };
        setGroups(prev => [...prev, tempNewGroup]);
        
        toast({
          title: "Sucesso",
          description: "Novo grupo criado com sucesso!",
        });
        
        // Refresh data to get the server-generated ID and ensure consistency
        await loadData();
      }
      
      return true;
    } catch (error: any) {
      console.error("Error saving group:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar grupo",
        description: error.message || "Ocorreu um erro desconhecido",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loadData, toast]);

  return {
    groups,
    empresas,
    isLoading,
    selectedGroup,
    setSelectedGroup,
    handleSaveGroup,
    refreshData: loadData
  };
};
