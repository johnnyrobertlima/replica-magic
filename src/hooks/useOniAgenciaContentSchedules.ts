import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getContentSchedules, 
  getAllContentSchedules,
  createContentSchedule, 
  updateContentSchedule, 
  deleteContentSchedule 
} from "@/services/oniAgenciaContentScheduleServices";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";
import { getServices } from "@/services/oniAgenciaServices";
import { getCollaborators } from "@/services/oniAgenciaCollaboratorServices";

export function useContentSchedules(clientId: string, year: number, month: number) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['oniAgenciaContentSchedules', clientId, year, month],
    queryFn: () => getContentSchedules(clientId, year, month),
    enabled: !!clientId && !!year && !!month,
  });
}

export function useAllContentSchedules(clientId: string) {
  return useQuery({
    queryKey: ['allOniAgenciaContentSchedules', clientId],
    queryFn: () => getAllContentSchedules(clientId),
    enabled: !!clientId,
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['oniAgenciaServices'],
    queryFn: getServices,
  });
}

export function useCollaborators() {
  return useQuery({
    queryKey: ['oniAgenciaCollaborators'],
    queryFn: getCollaborators,
  });
}

export function useCreateContentSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (newSchedule: ContentScheduleFormData) => createContentSchedule(newSchedule),
    onSuccess: (_, variables) => {
      const { client_id, scheduled_date } = variables;
      const date = new Date(scheduled_date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      queryClient.invalidateQueries({ 
        queryKey: ['oniAgenciaContentSchedules', client_id, year, month] 
      });
      
      toast({
        title: "Agendamento criado",
        description: "O agendamento de conteúdo foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar agendamento",
        description: "Ocorreu um erro ao criar o agendamento de conteúdo.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateContentSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, schedule }: { id: string; schedule: Partial<ContentScheduleFormData> }) => 
      updateContentSchedule(id, schedule),
    onSuccess: (_, variables) => {
      const { schedule } = variables;
      const { client_id, scheduled_date } = schedule;
      
      if (client_id && scheduled_date) {
        const date = new Date(scheduled_date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        queryClient.invalidateQueries({ 
          queryKey: ['oniAgenciaContentSchedules', client_id, year, month] 
        });
      } else {
        queryClient.invalidateQueries({ 
          queryKey: ['oniAgenciaContentSchedules'] 
        });
      }
      
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento de conteúdo foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar agendamento",
        description: "Ocorreu um erro ao atualizar o agendamento de conteúdo.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteContentSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: ({ id, clientId, year, month }: { id: string; clientId: string; year: number; month: number }) => {
      return deleteContentSchedule(id).then(() => ({ clientId, year, month }));
    },
    onSuccess: ({ clientId, year, month }) => {
      queryClient.invalidateQueries({ 
        queryKey: ['oniAgenciaContentSchedules', clientId, year, month] 
      });
      
      toast({
        title: "Agendamento excluído",
        description: "O agendamento de conteúdo foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir agendamento",
        description: "Ocorreu um erro ao excluir o agendamento de conteúdo.",
        variant: "destructive",
      });
    },
  });
}
