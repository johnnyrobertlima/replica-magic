
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCollaborators, createCollaborator, updateCollaborator, deleteCollaborator } from "@/services/oniAgenciaCollaboratorServices";
import { CollaboratorFormData } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";

export function useCollaborators() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['oniAgenciaCollaborators'],
    queryFn: getCollaborators,
  });
}

export function useCreateCollaborator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (newCollaborator: CollaboratorFormData) => createCollaborator(newCollaborator),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaCollaborators'] });
      toast({
        title: "Colaborador criado",
        description: "O colaborador foi criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error creating collaborator:", error);
      toast({
        title: "Erro ao criar colaborador",
        description: "Ocorreu um erro ao criar o colaborador.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateCollaborator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, collaborator }: { id: string; collaborator: CollaboratorFormData }) => {
      console.log("Updating collaborator with ID:", id, "Data:", collaborator);
      return updateCollaborator(id, collaborator);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaCollaborators'] });
      toast({
        title: "Colaborador atualizado",
        description: "O colaborador foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error updating collaborator:", error);
      toast({
        title: "Erro ao atualizar colaborador",
        description: "Ocorreu um erro ao atualizar o colaborador.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCollaborator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => deleteCollaborator(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaCollaborators'] });
      toast({
        title: "Colaborador excluído",
        description: "O colaborador foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error deleting collaborator:", error);
      toast({
        title: "Erro ao excluir colaborador",
        description: "Ocorreu um erro ao excluir o colaborador.",
        variant: "destructive",
      });
    },
  });
}
