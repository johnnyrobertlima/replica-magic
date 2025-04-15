
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
      const [fetchedGroups, fetchedEmpresas] = await Promise.all([
        fetchGroups(),
        fetchEmpresas()
      ]);
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
      await saveGroup(groupData);
      toast({
        title: "Sucesso",
        description: "Grupo salvo com sucesso!",
      });
      loadData();
      return true;
    } catch (error: any) {
      console.error("Error saving group:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar grupo",
        description: error.message || "Ocorreu um erro desconhecido",
      });
      return false;
    }
  }, [loadData, toast]);

  return {
    groups,
    empresas,
    isLoading,
    selectedGroup,
    setSelectedGroup,
    handleSaveGroup,
  };
};
