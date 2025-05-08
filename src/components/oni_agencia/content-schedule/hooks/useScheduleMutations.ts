
import { useState } from "react";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";

interface UseScheduleMutationsProps {
  clientId: string;
  onSuccess?: () => void;
}

export function useScheduleMutations({ clientId, onSuccess }: UseScheduleMutationsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent, currentSelectedEvent: CalendarEvent | null, formData: ContentScheduleFormData) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      console.log("Submitting schedule event", { formData, currentSelectedEvent });
      
      // Here would be API calls to create or update event
      
      toast({
        title: currentSelectedEvent ? "Agendamento atualizado" : "Agendamento criado",
        description: "Operação realizada com sucesso.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting schedule event:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar o agendamento.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStatusUpdate = async (e: React.FormEvent, currentSelectedEvent: CalendarEvent | null, formData: ContentScheduleFormData) => {
    e.preventDefault();
    
    if (!currentSelectedEvent) {
      console.error("Cannot update status: No event selected");
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("Updating event status", { 
        eventId: currentSelectedEvent.id,
        status: formData.status_id,
        note: formData.description
      });
      
      // Here would be API call to update status
      
      toast({
        title: "Status atualizado",
        description: "O status do agendamento foi atualizado com sucesso.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating event status:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do agendamento.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (currentSelectedEvent: CalendarEvent | null) => {
    if (!currentSelectedEvent) {
      console.error("Cannot delete: No event selected");
      return;
    }
    
    try {
      setIsDeleting(true);
      console.log("Deleting event", currentSelectedEvent.id);
      
      // Here would be API call to delete event
      
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Não foi possível excluir o agendamento.",
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
    handleDelete,
  };
}
