
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getClientScopes, 
  getClientScopesByClient, 
  createClientScope, 
  updateClientScope, 
  deleteClientScope 
} from "@/services/oniAgenciaClientScopeServices";
import { ClientScopeFormData } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";

export function useClientScopes() {
  return useQuery({
    queryKey: ['oniAgenciaClientScopes'],
    queryFn: getClientScopes,
  });
}

export function useClientScopesByClient(clientId: string | null) {
  return useQuery({
    queryKey: ['oniAgenciaClientScopes', clientId],
    queryFn: () => getClientScopesByClient(clientId || ''),
    enabled: !!clientId,
  });
}

export function useCreateClientScope() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (newScope: ClientScopeFormData) => createClientScope(newScope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaClientScopes'] });
      toast({
        title: "Escopo criado",
        description: "O escopo do cliente foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar escopo",
        description: "Ocorreu um erro ao criar o escopo do cliente.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateClientScope() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, scope }: { id: string; scope: Partial<ClientScopeFormData> }) => 
      updateClientScope(id, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaClientScopes'] });
      toast({
        title: "Escopo atualizado",
        description: "O escopo do cliente foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar escopo",
        description: "Ocorreu um erro ao atualizar o escopo do cliente.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteClientScope() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => deleteClientScope(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaClientScopes'] });
      toast({
        title: "Escopo excluído",
        description: "O escopo do cliente foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir escopo",
        description: "Ocorreu um erro ao excluir o escopo do cliente.",
        variant: "destructive",
      });
    },
  });
}
