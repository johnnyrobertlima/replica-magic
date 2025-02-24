
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { PermissionFormData } from "./types";

export const usePermissionMutations = (selectedGroupId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data: PermissionFormData) => {
      console.log("Creating permission with data:", {
        group_id: selectedGroupId,
        ...data,
      });
      
      const { error } = await supabase.from("group_permissions").insert({
        group_id: selectedGroupId,
        resource_path: data.resource_path,
        permission_type: data.permission_type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      
      if (error) {
        console.error("Error creating permission:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", selectedGroupId] });
      toast({
        title: "Permissão adicionada",
        description: "A permissão foi adicionada com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Erro ao adicionar permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting permission:", id);
      const { error } = await supabase
        .from("group_permissions")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Error deleting permission:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", selectedGroupId] });
      toast({
        title: "Permissão removida",
        description: "A permissão foi removida com sucesso!",
      });
    },
    onError: (error) => {
      console.error("Delete mutation error:", error);
      toast({
        title: "Erro ao remover permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    createMutation,
    deleteMutation,
  };
};

