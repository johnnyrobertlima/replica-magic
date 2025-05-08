
import { useState } from "react";
import { format } from "date-fns";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";
import { 
  useCreateContentSchedule, 
  useUpdateContentSchedule, 
  useDeleteContentSchedule 
} from "@/hooks/useOniAgenciaContentSchedules";

interface UseScheduleMutationsProps {
  onClose: () => void;
  clientId: string;
  selectedDate: Date;
  onManualRefetch?: () => void;
}

export function useScheduleMutations({
  onClose,
  clientId,
  selectedDate,
  onManualRefetch
}: UseScheduleMutationsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  // Mutations
  const createMutation = useCreateContentSchedule();
  const updateMutation = useUpdateContentSchedule();
  const deleteMutation = useDeleteContentSchedule();
  
  // Submit handler
  const handleSubmit = async (
    e: React.FormEvent, 
    selectedEvent: CalendarEvent | null, 
    formData: ContentScheduleFormData
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!formData.service_id) {
        throw new Error("Serviço é obrigatório");
      }
      
      if (!formData.title && formData.title !== null) {
        throw new Error("Título é obrigatório quando preenchido");
      }
      
      console.log("Form data being submitted:", formData);
      
      if (selectedEvent) {
        // Update existing event
        await updateMutation.mutateAsync({ 
          id: selectedEvent.id, 
          data: formData 
        });
        
        toast({
          title: "Agendamento atualizado",
          description: "O agendamento foi atualizado com sucesso."
        });
      } else {
        // Create new event
        await createMutation.mutateAsync(formData);
        
        toast({
          title: "Agendamento criado",
          description: "O agendamento foi criado com sucesso."
        });
      }
      
      // Trigger manual refetch if provided
      if (onManualRefetch) {
        console.log("Triggering manual refetch after mutation");
        onManualRefetch();
      }
      
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar o agendamento."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Status update handler - just updates status
  const handleStatusUpdate = async (
    e: React.FormEvent, 
    selectedEvent: CalendarEvent | null, 
    formData: ContentScheduleFormData
  ) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhum agendamento selecionado."
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const statusUpdateData: ContentScheduleFormData = {
        client_id: selectedEvent.client_id,
        service_id: selectedEvent.service_id || '',
        title: selectedEvent.title || '',
        scheduled_date: selectedEvent.scheduled_date,
        status_id: formData.status_id || null,
        collaborator_id: selectedEvent.collaborator_id,
        description: selectedEvent.description,
        execution_phase: selectedEvent.execution_phase,
        editorial_line_id: selectedEvent.editorial_line_id,
        product_id: selectedEvent.product_id,
        creators: selectedEvent.creators || [],
        capture_date: selectedEvent.capture_date || null,
        capture_end_date: selectedEvent.capture_end_date || null,
        is_all_day: selectedEvent.is_all_day !== null ? selectedEvent.is_all_day : true,
        location: selectedEvent.location || null
      };
      
      await updateMutation.mutateAsync({
        id: selectedEvent.id,
        data: statusUpdateData
      });
      
      toast({
        title: "Status atualizado",
        description: "O status do agendamento foi atualizado com sucesso."
      });
      
      // Trigger manual refetch if provided
      if (onManualRefetch) {
        console.log("Triggering manual refetch after status update");
        onManualRefetch();
      }
      
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do agendamento."
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete handler
  const handleDelete = async (selectedEvent: CalendarEvent | null) => {
    if (!selectedEvent) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhum agendamento selecionado."
      });
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await deleteMutation.mutateAsync(selectedEvent.id);
      
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso."
      });
      
      // Trigger manual refetch if provided
      if (onManualRefetch) {
        console.log("Triggering manual refetch after deletion");
        onManualRefetch();
      }
      
      onClose();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o agendamento."
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
