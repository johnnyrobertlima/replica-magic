
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, createClient, updateClient, deleteClient } from "@/services/oniAgenciaClientServices";
import { ClientFormData } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";

export function useClients() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['oniAgenciaClients'],
    queryFn: getClients,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (newClient: ClientFormData) => createClient(newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaClients'] });
      toast({
        title: "Cliente criado",
        description: "O cliente foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar cliente",
        description: "Ocorreu um erro ao criar o cliente.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, client }: { id: string; client: ClientFormData }) => 
      updateClient(id, client),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaClients'] });
      toast({
        title: "Cliente atualizado",
        description: "O cliente foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: "Ocorreu um erro ao atualizar o cliente.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaClients'] });
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir cliente",
        description: "Ocorreu um erro ao excluir o cliente.",
        variant: "destructive",
      });
    },
  });
}
