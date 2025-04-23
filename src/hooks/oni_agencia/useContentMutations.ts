
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { 
  createContentSchedule, 
  updateContentSchedule, 
  deleteContentSchedule 
} from "@/services/oniAgenciaContentScheduleServices";

export function useCreateContentSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (newSchedule: ContentScheduleFormData) => {
      const processedSchedule = {
        ...newSchedule,
        creators: Array.isArray(newSchedule.creators) ? newSchedule.creators : []
      };
      
      console.log("Creating schedule with data:", processedSchedule);
      return createContentSchedule(processedSchedule);
    },
    onSuccess: (_, variables) => {
      const { client_id, scheduled_date } = variables;
      const date = new Date(scheduled_date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      queryClient.invalidateQueries({ 
        queryKey: ['oniAgenciaContentSchedules', client_id, year, month] 
      });
      
      queryClient.invalidateQueries({
        queryKey: ['allOniAgenciaContentSchedules', client_id]
      });
      
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error creating content schedule:', error);
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
    mutationFn: ({ id, schedule }: { id: string; schedule: Partial<ContentScheduleFormData> }) => {
      const processedSchedule = {
        ...schedule,
        creators: Array.isArray(schedule.creators) ? schedule.creators : 
                (schedule.creators === undefined ? undefined : [])
      };
      
      console.log("Updating schedule ID:", id, "with data:", processedSchedule);
      return updateContentSchedule(id, processedSchedule);
    },
    onSuccess: (_, variables) => {
      const { schedule } = variables;
      const { client_id } = schedule;
      
      if (client_id) {
        queryClient.invalidateQueries({ 
          queryKey: ['oniAgenciaContentSchedules', client_id] 
        });
        
        queryClient.invalidateQueries({
          queryKey: ['allOniAgenciaContentSchedules', client_id]
        });
      }
      
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating content schedule:', error);
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
      
      queryClient.invalidateQueries({
        queryKey: ['allOniAgenciaContentSchedules', clientId]
      });
      
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error deleting content schedule:', error);
      toast({
        title: "Erro ao excluir agendamento",
        description: "Ocorreu um erro ao excluir o agendamento de conteúdo.",
        variant: "destructive",
      });
    },
  });
}
