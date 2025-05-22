import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { format } from "date-fns";

interface ScheduleMutationsProps {
  clientId: string;
  selectedDate: Date;
  onClose: () => void;
  onManualRefetch?: () => void;
}

export function useScheduleMutations({
  clientId,
  selectedDate,
  onClose,
  onManualRefetch
}: ScheduleMutationsProps) {
  const queryClient = useQueryClient();
  const [mutationError, setMutationError] = useState<string | null>(null);

  const resetError = () => {
    setMutationError(null);
  };

  const createScheduleMutation = useMutation(
    async (data: ContentScheduleFormData) => {
      // Convert Date objects to strings in the correct format
      const scheduledDate = data.scheduled_date ? format(data.scheduled_date, 'yyyy-MM-dd HH:mm:ss') : null;
      const captureDate = data.capture_date ? format(data.capture_date, 'yyyy-MM-dd HH:mm:ss') : null;
      const captureEndDate = data.capture_end_date ? format(data.capture_end_date, 'yyyy-MM-dd HH:mm:ss') : null;
      
      const { data: newSchedule, error } = await supabase
        .from('oni_agencia_content_schedule')
        .insert([
          {
            client_id: data.client_id,
            service_id: data.service_id,
            collaborator_id: data.collaborator_id,
            title: data.title,
            description: data.description,
            scheduled_date: scheduledDate,
            execution_phase: data.execution_phase,
            editorial_line_id: data.editorial_line_id,
            product_id: data.product_id,
            status_id: data.status_id,
            creators: data.creators,
            capture_date: captureDate,
            capture_end_date: captureEndDate,
            is_all_day: data.is_all_day,
            location: data.location
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating schedule:", error);
        throw error;
      }

      return newSchedule;
    },
    {
      onSuccess: (newSchedule) => {
        console.log("Schedule created successfully:", newSchedule);
        resetError();
        // Invalidate queries to update the cache
        queryClient.invalidateQueries({ queryKey: ['schedules', clientId] });
        queryClient.invalidateQueries({ queryKey: ['eventsByDate', clientId, selectedDate] });
        if (onManualRefetch) {
          onManualRefetch();
        }
        onClose();
      },
      onError: (error: any) => {
        console.error("Error creating schedule:", error);
        setMutationError("Erro ao criar agendamento. Por favor, tente novamente.");
      },
    }
  );

  const updateScheduleMutation = useMutation(
    async ({ id, data }: { id: string, data: ContentScheduleFormData }) => {
      // Convert Date objects to strings in the correct format
      const scheduledDate = data.scheduled_date ? format(data.scheduled_date, 'yyyy-MM-dd HH:mm:ss') : null;
      const captureDate = data.capture_date ? format(data.capture_date, 'yyyy-MM-dd HH:mm:ss') : null;
      const captureEndDate = data.capture_end_date ? format(data.capture_end_date, 'yyyy-MM-dd HH:mm:ss') : null;
      
      const { data: updatedSchedule, error } = await supabase
        .from('oni_agencia_content_schedule')
        .update({
          client_id: data.client_id,
          service_id: data.service_id,
          collaborator_id: data.collaborator_id,
          title: data.title,
          description: data.description,
          scheduled_date: scheduledDate,
          execution_phase: data.execution_phase,
          editorial_line_id: data.editorial_line_id,
          product_id: data.product_id,
          status_id: data.status_id,
          creators: data.creators,
          capture_date: captureDate,
          capture_end_date: captureEndDate,
          is_all_day: data.is_all_day,
          location: data.location
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating schedule:", error);
        throw error;
      }

      return updatedSchedule;
    },
    {
      onSuccess: (updatedSchedule) => {
        console.log("Schedule updated successfully:", updatedSchedule);
        resetError();
        // Invalidate queries to update the cache
        queryClient.invalidateQueries({ queryKey: ['schedules', clientId] });
        queryClient.invalidateQueries({ queryKey: ['eventsByDate', clientId, selectedDate] });
        if (onManualRefetch) {
          onManualRefetch();
        }
        onClose();
      },
      onError: (error: any) => {
        console.error("Error updating schedule:", error);
        setMutationError("Erro ao atualizar agendamento. Por favor, tente novamente.");
      },
    }
  );

  const updateScheduleStatusMutation = useMutation(
    async ({ id, data }: { id: string, data: ContentScheduleFormData }) => {
      const { data: updatedSchedule, error } = await supabase
        .from('oni_agencia_content_schedule')
        .update({
          status_id: data.status_id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating schedule status:", error);
        throw error;
      }

      return updatedSchedule;
    },
    {
      onSuccess: (updatedSchedule) => {
        console.log("Schedule status updated successfully:", updatedSchedule);
        resetError();
        // Invalidate queries to update the cache
        queryClient.invalidateQueries({ queryKey: ['schedules', clientId] });
         queryClient.invalidateQueries({ queryKey: ['eventsByDate', clientId, selectedDate] });
        if (onManualRefetch) {
          onManualRefetch();
        }
        onClose();
      },
      onError: (error: any) => {
        console.error("Error updating schedule status:", error);
        setMutationError("Erro ao atualizar o status do agendamento. Por favor, tente novamente.");
      },
    }
  );

  const deleteScheduleMutation = useMutation(
    async (id: string) => {
      const { data, error } = await supabase
        .from('oni_agencia_content_schedule')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting schedule:", error);
        throw error;
      }

      return data;
    },
    {
      onSuccess: () => {
        console.log("Schedule deleted successfully");
        resetError();
        // Invalidate queries to update the cache
        queryClient.invalidateQueries({ queryKey: ['schedules', clientId] });
        queryClient.invalidateQueries({ queryKey: ['eventsByDate', clientId, selectedDate] });
        if (onManualRefetch) {
          onManualRefetch();
        }
        onClose();
      },
      onError: (error: any) => {
        console.error("Error deleting schedule:", error);
        setMutationError("Erro ao excluir agendamento. Por favor, tente novamente.");
      },
    }
  );

  const validateFormData = (data: ContentScheduleFormData): string | null => {
    // Validação de campos obrigatórios
    if (!data.client_id) {
      return "O cliente é obrigatório.";
    }
    
    if (!data.service_id) {
      return "O serviço é obrigatório.";
    }
    
    // Scheduled date só é obrigatório se não temos capture_date
    if (!data.scheduled_date && !data.capture_date) {
      return "É necessário definir uma data de agendamento ou de captura.";
    }
    
    return null; // Sem erros
  };

  const handleSubmit = async (
    e: React.FormEvent,
    currentSelectedEvent: any,
    formData: ContentScheduleFormData
  ) => {
    e.preventDefault();
    resetError();

    const validationError = validateFormData(formData);
    if (validationError) {
      setMutationError(validationError);
      return;
    }

    if (currentSelectedEvent) {
      // Update existing event
      updateScheduleMutation.mutate({ id: currentSelectedEvent.id, data: formData });
    } else {
      // Create new event
      createScheduleMutation.mutate(formData);
    }
  };

  const handleStatusUpdate = async (
    e: React.FormEvent,
    currentSelectedEvent: any,
    formData: ContentScheduleFormData
  ) => {
    e.preventDefault();
    resetError();

    if (currentSelectedEvent) {
      // Update existing event status
      updateScheduleStatusMutation.mutate({ id: currentSelectedEvent.id, data: formData });
    } else {
      setMutationError("Nenhum agendamento selecionado para atualizar o status.");
    }
  };

  const handleDelete = async (currentSelectedEvent: any) => {
    resetError();

    if (currentSelectedEvent) {
      // Delete existing event
      deleteScheduleMutation.mutate(currentSelectedEvent.id);
    } else {
      setMutationError("Nenhum agendamento selecionado para excluir.");
    }
  };

  return {
    handleSubmit,
    handleStatusUpdate,
    handleDelete,
    isSubmitting: createScheduleMutation.isLoading || updateScheduleMutation.isLoading || updateScheduleStatusMutation.isLoading,
    isDeleting: deleteScheduleMutation.isLoading,
    mutationError,
  };
}
