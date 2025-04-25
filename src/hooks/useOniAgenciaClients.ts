
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, createClient, updateClient, deleteClient } from "@/services/oniAgenciaClientServices";
import { ClientFormData } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useClients() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['oniAgenciaClients'],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      
      if (!session) throw new Error('No session');

      const { data, error } = await supabase
        .from('oni_agencia_clients')
        .select('*')
        .or(`id.in.(select client_id from group_client_access gca 
             join user_groups ug on gca.group_id = ug.group_id 
             where ug.user_id = ${session.user.id}),
             (select exists(select 1 from group_client_access gca 
             join user_groups ug on gca.group_id = ug.group_id 
             where ug.user_id = ${session.user.id} and gca.all_clients = true))`);

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      return data;
    },
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
