
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useItemGroups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const { toast } = useToast();

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

  return {
    groups,
    fetchGroups,
  };
};
