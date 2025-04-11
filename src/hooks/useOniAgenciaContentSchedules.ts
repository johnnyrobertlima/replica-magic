
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
import { useEditorialLines, useProducts, useStatuses } from "./useOniAgenciaThemes";

export function useContentSchedules(clientId: string, year: number, month: number) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['oniAgenciaContentSchedules', clientId, year, month],
    queryFn: () => getContentSchedules(clientId, year, month),
    enabled: !!clientId && !!year && !!month,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when window gets focus
  });
}

export function useAllContentSchedules(clientId: string) {
  return useQuery({
    queryKey: ['allOniAgenciaContentSchedules', clientId],
    queryFn: () => getAllContentSchedules(clientId),
    enabled: !!clientId,
    staleTime: 30000, // Consider data fresh for 30 seconds
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

export { useEditorialLines, useProducts, useStatuses };

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
      
      // Invalidate both specific month query and all schedules
      queryClient.invalidateQueries({ 
        queryKey: ['oniAgenciaContentSchedules', client_id, year, month] 
      });
      
      queryClient.invalidateQueries({
        queryKey: ['allOniAgenciaContentSchedules', client_id]
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
    mutationFn: ({ id, schedule }: { id: string; schedule: Partial<ContentScheduleFormData> }) => 
      updateContentSchedule(id, schedule),
    onSuccess: (data, variables) => {
      const { schedule } = variables;
      const { client_id } = schedule;
      
      if (client_id) {
        // Invalidate all relevant queries
        queryClient.invalidateQueries({ 
          queryKey: ['oniAgenciaContentSchedules', client_id] 
        });
        
        queryClient.invalidateQueries({
          queryKey: ['allOniAgenciaContentSchedules', client_id]
        });
      } else {
        // If client_id is not available, invalidate all schedules
        queryClient.invalidateQueries({ 
          queryKey: ['oniAgenciaContentSchedules'] 
        });
        
        queryClient.invalidateQueries({
          queryKey: ['allOniAgenciaContentSchedules']
        });
      }
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
      // Invalidate both specific month query and all schedules
      queryClient.invalidateQueries({ 
        queryKey: ['oniAgenciaContentSchedules', clientId, year, month] 
      });
      
      queryClient.invalidateQueries({
        queryKey: ['allOniAgenciaContentSchedules', clientId]
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
