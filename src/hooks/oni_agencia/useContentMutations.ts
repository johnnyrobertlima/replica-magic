import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { 
  createContentSchedule, 
  updateContentSchedule, 
  deleteContentSchedule 
} from "@/services/oniAgenciaContentScheduleServices";
import { supabase } from "@/integrations/supabase/client";

export function useCreateContentSchedule() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newSchedule: ContentScheduleFormData) => {
      const processedSchedule = {
        ...newSchedule,
        creators: Array.isArray(newSchedule.creators) ? newSchedule.creators : []
      };
      
      // Create the schedule
      const { data, error } = await supabase
        .from('oni_agencia_content_schedules')
        .insert(processedSchedule)
        .select()
        .single();

      if (error) throw error;

      // Record creation in history
      const { error: historyError } = await supabase
        .from('oni_agencia_schedule_history')
        .insert({
          schedule_id: data.id,
          field_name: 'Criação',
          new_value: 'Agendamento criado',
          changed_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (historyError) throw historyError;

      return data;
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
    mutationFn: async ({ id, schedule }: { id: string; schedule: Partial<ContentScheduleFormData> }) => {
      // Get current state for comparison
      const { data: currentState, error: fetchError } = await supabase
        .from('oni_agencia_content_schedules')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update the schedule
      const { data, error } = await supabase
        .from('oni_agencia_content_schedules')
        .update(schedule)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Record changes in history
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const changes = [];

      // Compare and record changes
      for (const [key, newValue] of Object.entries(schedule)) {
        const oldValue = currentState[key];
        if (newValue !== oldValue) {
          changes.push({
            schedule_id: id,
            field_name: key,
            old_value: oldValue?.toString() || null,
            new_value: newValue?.toString() || '',
            changed_by: userId
          });
        }
      }

      if (changes.length > 0) {
        const { error: historyError } = await supabase
          .from('oni_agencia_schedule_history')
          .insert(changes);

        if (historyError) throw historyError;
      }

      return data;
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
