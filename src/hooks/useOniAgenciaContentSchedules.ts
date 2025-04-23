
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

// Cache time constants
const MINUTE = 60 * 1000;
const CACHE_TIME = 10 * MINUTE; // 10 minutos
const STALE_TIME = 2 * MINUTE;  // 2 minutos

export function useContentSchedules(clientId: string, year: number, month: number) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['oniAgenciaContentSchedules', clientId, year, month],
    queryFn: () => getContentSchedules(clientId, year, month),
    enabled: !!clientId && !!year && !!month,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false, // Só atualiza manualmente ou por invalidação
  });
}

export function useAllContentSchedules(clientId: string) {
  return useQuery({
    queryKey: ['allOniAgenciaContentSchedules', clientId],
    queryFn: () => getAllContentSchedules(clientId),
    enabled: !!clientId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
  });
}

export function useServices() {
  return useQuery({
    queryKey: ['oniAgenciaServices'],
    queryFn: getServices,
    staleTime: CACHE_TIME, // Dados que raramente mudam
    gcTime: CACHE_TIME * 2,
  });
}

export function useCollaborators() {
  return useQuery({
    queryKey: ['oniAgenciaCollaborators'],
    queryFn: getCollaborators,
    staleTime: CACHE_TIME, // Dados que raramente mudam
    gcTime: CACHE_TIME * 2,
  });
}

export { useEditorialLines, useProducts, useStatuses };

export function useCreateContentSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (newSchedule: ContentScheduleFormData) => {
      // Garantir que creators seja formatado corretamente antes de enviar para API
      const processedSchedule = {
        ...newSchedule,
        creators: Array.isArray(newSchedule.creators) ? newSchedule.creators : []
      };
      
      // Log do que estamos enviando para a API para debug
      console.log("Creating schedule with data:", processedSchedule);
      
      return createContentSchedule(processedSchedule);
    },
    onSuccess: (_, variables) => {
      const { client_id, scheduled_date } = variables;
      const date = new Date(scheduled_date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      
      // Invalidar tanto a consulta do mês específico quanto todos os agendamentos
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
      // Garantir que creators seja formatado corretamente antes de enviar para API
      const processedSchedule = {
        ...schedule,
        creators: Array.isArray(schedule.creators) ? schedule.creators : 
                (schedule.creators === undefined ? undefined : [])
      };
      
      // Log do que estamos atualizando para debug
      console.log("Updating schedule ID:", id, "with data:", processedSchedule);
      
      return updateContentSchedule(id, processedSchedule);
    },
    onSuccess: (data, variables) => {
      const { schedule } = variables;
      const { client_id } = schedule;
      
      if (client_id) {
        // Invalidar todas as consultas relevantes
        queryClient.invalidateQueries({ 
          queryKey: ['oniAgenciaContentSchedules', client_id] 
        });
        
        queryClient.invalidateQueries({
          queryKey: ['allOniAgenciaContentSchedules', client_id]
        });
      } else {
        // Se client_id não está disponível, invalidar consultas mais amplas
        queryClient.invalidateQueries({ 
          queryKey: ['oniAgenciaContentSchedules'] 
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
      // Invalidar tanto a consulta do mês específico quanto todos os agendamentos
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
