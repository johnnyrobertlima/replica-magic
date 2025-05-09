
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Group, GroupFormData } from "./types";

export const useGroupMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: GroupFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      try {
        const { error, data: newGroup } = await supabase
          .from("groups")
          .insert([data])
          .select();
        
        if (error) throw error;
        return newGroup;
      } catch (error: any) {
        console.error("Error creating group:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Grupo criado",
        description: "O grupo foi criado com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao criar grupo:", error);
      toast({
        title: "Erro ao criar grupo",
        description: error.message || "Ocorreu um erro ao criar o grupo",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GroupFormData }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      try {
        const { error } = await supabase
          .from("groups")
          .update(data)
          .eq("id", id)
          .select()
          .single();
        
        if (error) throw error;
      } catch (error: any) {
        console.error("Error updating group:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Grupo atualizado",
        description: "O grupo foi atualizado com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar grupo:", error);
      toast({
        title: "Erro ao atualizar grupo",
        description: error.message || "Ocorreu um erro ao atualizar o grupo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      try {
        const { error } = await supabase
          .from("groups")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
      } catch (error: any) {
        console.error("Error deleting group:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast({
        title: "Grupo excluído",
        description: "O grupo foi excluído com sucesso!",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao excluir grupo:", error);
      toast({
        title: "Erro ao excluir grupo",
        description: error.message || "Ocorreu um erro ao excluir o grupo",
        variant: "destructive",
      });
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
