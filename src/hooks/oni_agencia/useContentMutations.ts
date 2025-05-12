
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      
      // Add a timeout to prevent UI freezing
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("A solicitação expirou. Por favor, tente novamente."));
        }, 30000); // 30 second timeout
        
        createContentSchedule(data)
          .then(result => {
            clearTimeout(timeoutId);
            resolve(result);
          })
          .catch(error => {
            clearTimeout(timeoutId);
            reject(error);
          });
      });
    },
    onSuccess: () => {
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });
      
      // Invalidate all content schedules queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      
      // Also invalidate resources in case they're related
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaCollaborators'] });
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaStatuses'] });
    },
    onError: (error: any) => {
      console.error("Error creating content schedule:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar agendamento",
        description: error?.message || "Não foi possível criar o agendamento. Tente novamente.",
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
      
      // Add a timeout to avoid UI freezing and give feedback to user
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("A solicitação expirou. Por favor, tente novamente."));
        }, 30000); // 30 second timeout
        
        updateContentSchedule(id, data)
          .then(result => {
            clearTimeout(timeoutId);
            resolve(result);
          })
          .catch(error => {
            clearTimeout(timeoutId);
            console.error("Error in update mutation:", error);
            reject(error);
          });
      });
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches to avoid race conditions
      await queryClient.cancelQueries({ queryKey: ['content-schedules'] });
      await queryClient.cancelQueries({ queryKey: ['infinite-content-schedules'] });
      await queryClient.cancelQueries({ queryKey: ['scheduleHistory'] });
      
      // Return a context with the previous data
      return { id, previousData: data };
    },
    onSuccess: () => {
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso.",
      });
      
      // Invalidate all queries related to content schedules to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['scheduleHistory'] });
      
      // Also invalidate resources in case they're related
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaCollaborators'] });
      queryClient.invalidateQueries({ queryKey: ['oniAgenciaStatuses'] });
    },
    onError: (error: any) => {
      console.error("Error updating content schedule:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar agendamento",
        description: error?.message || "Não foi possível atualizar o agendamento. Tente novamente.",
      });
      
      // Refetch to restore the correct data
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    }
  });
}

export function useDeleteContentSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting content schedule with id:", id);
      
      // Add a timeout to prevent UI freezing
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("A solicitação expirou. Por favor, tente novamente."));
        }, 30000); // 30 second timeout
        
        deleteContentSchedule(id)
          .then(result => {
            clearTimeout(timeoutId);
            resolve(result);
          })
          .catch(error => {
            clearTimeout(timeoutId);
            reject(error);
          });
      });
    },
    onSuccess: () => {
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso.",
      });
      
      // Invalidate all content schedules queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    },
    onError: (error: any) => {
      console.error("Error deleting content schedule:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir agendamento",
        description: error?.message || "Não foi possível excluir o agendamento. Tente novamente.",
      });
      
      // If there's an error, we should refetch to restore the correct data
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    }
  });
}
