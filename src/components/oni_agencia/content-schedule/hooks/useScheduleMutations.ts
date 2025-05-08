
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { createContentSchedule, updateContentSchedule, deleteContentSchedule } from "@/services/oniAgenciaContentScheduleServices";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export interface UseScheduleMutationsProps {
  clientId: string;
  selectedDate?: Date;
  onSuccess?: () => void;
  onManualRefetch?: () => void;
  onClose?: () => void;
}

export function useScheduleMutations({
  clientId,
  selectedDate,
  onSuccess,
  onManualRefetch,
  onClose
}: UseScheduleMutationsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Submit handler for creating/updating events
  const handleSubmit = async (
    e: React.FormEvent,
    currentSelectedEvent: CalendarEvent | null,
    formData: ContentScheduleFormData
  ) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (currentSelectedEvent) {
        // Update existing event
        await updateContentSchedule(currentSelectedEvent.id, formData);
        toast({
          title: "Atualizado com sucesso!",
          description: "O agendamento foi atualizado.",
        });
      } else {
        // Create new event
        await createContentSchedule(formData);
        toast({
          title: "Criado com sucesso!",
          description: "O agendamento foi criado.",
        });
      }
      
      // Invalidate queries to refresh data
      if (selectedDate) {
        queryClient.invalidateQueries({
          queryKey: ['events', clientId, format(selectedDate, 'yyyy-MM-dd')]
        });
      }
      
      queryClient.invalidateQueries({
        queryKey: ['contentSchedules', clientId]
      });
      
      // Trigger specific refetch if provided
      if (onManualRefetch) {
        onManualRefetch();
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the dialog if onClose is provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Houve um erro ao salvar o agendamento."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for updating just the status
  const handleStatusUpdate = async (
    e: React.FormEvent,
    currentSelectedEvent: CalendarEvent | null,
    formData: ContentScheduleFormData
  ) => {
    e.preventDefault();
    
    if (!currentSelectedEvent) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhum agendamento selecionado."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Update only the status
      await updateContentSchedule(currentSelectedEvent.id, {
        status_id: formData.status_id
      });
      
      toast({
        title: "Status atualizado!",
        description: "O status do agendamento foi atualizado."
      });
      
      // Invalidate relevant queries
      if (selectedDate) {
        queryClient.invalidateQueries({
          queryKey: ['events', clientId, format(selectedDate, 'yyyy-MM-dd')]
        });
      }
      
      queryClient.invalidateQueries({
        queryKey: ['contentSchedules', clientId]
      });
      
      if (onManualRefetch) {
        onManualRefetch();
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Houve um erro ao atualizar o status."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handler for deleting events
  const handleDelete = async (currentSelectedEvent: CalendarEvent | null) => {
    if (!currentSelectedEvent) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhum agendamento selecionado para exclusão."
      });
      return;
    }
    
    if (!confirm("Tem certeza que deseja excluir este agendamento?")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      await deleteContentSchedule(currentSelectedEvent.id);
      
      toast({
        title: "Excluído com sucesso!",
        description: "O agendamento foi excluído."
      });
      
      // Invalidate relevant queries
      if (selectedDate) {
        queryClient.invalidateQueries({
          queryKey: ['events', clientId, format(selectedDate, 'yyyy-MM-dd')]
        });
      }
      
      queryClient.invalidateQueries({
        queryKey: ['contentSchedules', clientId]
      });
      
      if (onManualRefetch) {
        onManualRefetch();
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Houve um erro ao excluir o agendamento."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isSubmitting,
    isDeleting,
    handleSubmit,
    handleStatusUpdate,
    handleDelete
  };
}
