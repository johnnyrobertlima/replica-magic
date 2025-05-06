
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  createContentSchedule, 
  updateContentSchedule, 
  deleteContentSchedule 
} from "@/services/oniAgenciaContentScheduleServices";
import { ContentScheduleFormData, CalendarEvent } from "@/types/oni-agencia";

export function useCreateContentSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ContentScheduleFormData) => {
      console.log("Creating content schedule with data:", data);
      return createContentSchedule(data);
    },
    onSuccess: () => {
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });
      
      // Invalidate all content schedules queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      
      // Also invalidate infinite queries
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    },
    onError: (error) => {
      console.error("Error creating content schedule:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar agendamento",
        description: "Não foi possível criar o agendamento. Tente novamente.",
      });
    }
  });
}

export function useUpdateContentSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContentScheduleFormData }) => {
      console.log("Updating content schedule with id:", id, "data:", data);
      return updateContentSchedule(id, data);
    },
    onSuccess: () => {
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso.",
      });
      
      // Invalidate all queries related to content schedules
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      
      // Also invalidate infinite queries
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      
      // Invalidate history queries
      queryClient.invalidateQueries({ queryKey: ['scheduleHistory'] });
    },
    onError: (error) => {
      console.error("Error updating content schedule:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar agendamento",
        description: "Não foi possível atualizar o agendamento. Tente novamente.",
      });
    }
  });
}

export function useDeleteContentSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting content schedule with id:", id);
      return deleteContentSchedule(id);
    },
    onSuccess: () => {
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso.",
      });
      
      // Invalidate all content schedules queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      
      // Also invalidate infinite queries
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    },
    onError: (error) => {
      console.error("Error deleting content schedule:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir agendamento",
        description: "Não foi possível excluir o agendamento. Tente novamente.",
      });
    }
  });
}
