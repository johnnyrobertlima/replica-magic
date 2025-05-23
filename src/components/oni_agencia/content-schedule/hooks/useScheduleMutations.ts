
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { 
  createContentSchedule,
  updateContentSchedule,
  deleteContentSchedule
} from "@/services/oniAgenciaContentScheduleServices";

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

  const createScheduleMutation = useMutation({
    mutationFn: async (data: ContentScheduleFormData) => {
      console.log("Creating schedule with data:", data);
      return createContentSchedule(data);
    },
    onSuccess: (newSchedule) => {
      console.log("Schedule created successfully:", newSchedule);
      resetError();
      // Invalidate queries to update the cache
      queryClient.invalidateQueries({ queryKey: ['schedules', clientId] });
      queryClient.invalidateQueries({ queryKey: ['eventsByDate', clientId, selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      if (onManualRefetch) {
        onManualRefetch();
      }
      onClose();
    },
    onError: (error: any) => {
      console.error("Error creating schedule:", error);
      setMutationError("Erro ao criar agendamento. Por favor, tente novamente.");
    },
  });

  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: ContentScheduleFormData }) => {
      console.log("Updating schedule with id:", id, "data:", data);
      return updateContentSchedule(id, data);
    },
    onSuccess: (updatedSchedule) => {
      console.log("Schedule updated successfully:", updatedSchedule);
      resetError();
      // Invalidate queries to update the cache
      queryClient.invalidateQueries({ queryKey: ['schedules', clientId] });
      queryClient.invalidateQueries({ queryKey: ['eventsByDate', clientId, selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      if (onManualRefetch) {
        onManualRefetch();
      }
      onClose();
    },
    onError: (error: any) => {
      console.error("Error updating schedule:", error);
      setMutationError("Erro ao atualizar agendamento. Por favor, tente novamente.");
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting schedule with id:", id);
      return deleteContentSchedule(id);
    },
    onSuccess: () => {
      console.log("Schedule deleted successfully");
      resetError();
      // Invalidate queries to update the cache
      queryClient.invalidateQueries({ queryKey: ['schedules', clientId] });
      queryClient.invalidateQueries({ queryKey: ['eventsByDate', clientId, selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      if (onManualRefetch) {
        onManualRefetch();
      }
      onClose();
    },
    onError: (error: any) => {
      console.error("Error deleting schedule:", error);
      setMutationError("Erro ao excluir agendamento. Por favor, tente novamente.");
    },
  });

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
    // Use the same handleSubmit function to save all data
    return handleSubmit(e, currentSelectedEvent, formData);
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
    isSubmitting: createScheduleMutation.isPending || updateScheduleMutation.isPending,
    isDeleting: deleteScheduleMutation.isPending,
    mutationError,
  };
}
