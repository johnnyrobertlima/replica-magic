
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getServices, createService, updateService, deleteService } from "@/services/oniAgenciaServices";
import { ServiceFormData } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";

export function useServices() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['oniAgenciaServices'],
    queryFn: getServices,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (newService: ServiceFormData) => createService(newService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaServices'] });
      toast({
        title: "Serviço criado",
        description: "O serviço foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar serviço",
        description: "Ocorreu um erro ao criar o serviço.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, service }: { id: string; service: ServiceFormData }) => 
      updateService(id, service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaServices'] });
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar serviço",
        description: "Ocorreu um erro ao atualizar o serviço.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaServices'] });
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir serviço",
        description: "Ocorreu um erro ao excluir o serviço.",
        variant: "destructive",
      });
    },
  });
}
