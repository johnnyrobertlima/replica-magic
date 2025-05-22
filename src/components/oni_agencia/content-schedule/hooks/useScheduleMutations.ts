
import { useState, useCallback } from "react";
import { useCreateContentSchedule, useUpdateContentSchedule, useDeleteContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

// Update the interface to include onSuccess and onManualRefetch
interface UseScheduleMutationsProps {
  clientId: string;
  selectedDate: Date;
  onClose?: () => void;
  onSuccess?: () => void;
  onManualRefetch?: () => void;
}

// Helper function to convert Date objects to strings for API
const convertDatesToStrings = (data: ContentScheduleFormData | Partial<ContentScheduleFormData>) => {
  const result: Record<string, any> = { ...data };
  
  // Convert Date objects to string format expected by API
  if (data.scheduled_date instanceof Date) {
    result.scheduled_date = format(data.scheduled_date, 'yyyy-MM-dd');
  }
  
  if (data.capture_date instanceof Date) {
    if (data.is_all_day) {
      result.capture_date = format(data.capture_date, 'yyyy-MM-dd');
    } else {
      result.capture_date = format(data.capture_date, "yyyy-MM-dd'T'HH:mm:ss");
    }
  }
  
  if (data.capture_end_date instanceof Date) {
    if (data.is_all_day) {
      result.capture_end_date = format(data.capture_end_date, 'yyyy-MM-dd');
    } else {
      result.capture_end_date = format(data.capture_end_date, "yyyy-MM-dd'T'HH:mm:ss");
    }
  }
  
  return result;
};

export function useScheduleMutations({
  clientId,
  selectedDate,
  onClose,
  onSuccess,
  onManualRefetch
}: UseScheduleMutationsProps) {
  // Local state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get mutation hooks
  const createMutation = useCreateContentSchedule();
  const updateMutation = useUpdateContentSchedule();
  const deleteMutation = useDeleteContentSchedule();

  // Function to manually refetch resources
  const refetchResources = useCallback(() => {
    console.log("Manually refetching resources");
    // Invalidate all content schedule related queries
    queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
    queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    queryClient.invalidateQueries({ queryKey: ['events'] });
    
    // Also invalidate resources
    queryClient.invalidateQueries({ queryKey: ['oniAgenciaCollaborators'] });
    queryClient.invalidateQueries({ queryKey: ['oniAgenciaServices'] });
    queryClient.invalidateQueries({ queryKey: ['oniAgenciaStatuses'] });
    queryClient.invalidateQueries({ queryKey: ['oniAgenciaThemes'] });
    queryClient.invalidateQueries({ queryKey: ['oniAgenciaClients'] });
    queryClient.invalidateQueries({ queryKey: ['scheduleHistory'] });
    
    if (onManualRefetch) {
      onManualRefetch();
    }
    
    toast({
      title: "Atualizando dados",
      description: "Tentando recarregar os recursos necessários...",
    });
  }, [queryClient, onManualRefetch, toast]);

  // Handle form submission (create or update)
  const handleSubmit = useCallback(
    async (e: React.FormEvent, currentSelectedEvent: CalendarEvent | null, formData: ContentScheduleFormData) => {
      e.preventDefault();
      
      try {
        setIsSubmitting(true);
        console.log("Submitting form with data:", formData);
        
        // Determine if we're creating or updating
        if (currentSelectedEvent) {
          console.log("Updating existing event:", currentSelectedEvent.id);
          // Update existing schedule with full data to ensure all fields are updated
          await updateMutation.mutateAsync({ 
            id: currentSelectedEvent.id,
            data: formData
          });
        } else {
          // Create new schedule
          console.log("Creating new event");
          await createMutation.mutateAsync(formData);
        }
        
        // Call the onSuccess callback if provided
        if (onSuccess) onSuccess();
        
        // Clear cache and refetch to get fresh data
        refetchResources();
        
        // Close the dialog after successful submission
        if (onClose) onClose();
        
        toast({
          title: currentSelectedEvent ? "Agendamento atualizado" : "Agendamento criado",
          description: currentSelectedEvent 
            ? "O agendamento foi atualizado com sucesso." 
            : "O agendamento foi criado com sucesso.",
        });
      } catch (error) {
        console.error("Error submitting content schedule:", error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações. Por favor, tente novamente."
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [createMutation, updateMutation, onClose, onSuccess, refetchResources, toast]
  );
  
  // Handle status update
  const handleStatusUpdate = useCallback(
    async (e: React.FormEvent, currentSelectedEvent: CalendarEvent | null, formData: ContentScheduleFormData) => {
      e.preventDefault();
      
      if (!currentSelectedEvent) {
        console.error("No event selected");
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nenhum agendamento selecionado para atualizar."
        });
        return;
      }
      
      // Validate that status is selected
      if (!formData.status_id || formData.status_id === "null") {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Por favor, selecione um status válido."
        });
        return;
      }
      
      try {
        setIsSubmitting(true);
        
        // Create a status update object with only the fields we want to update
        // This ensures we don't accidentally overwrite other fields
        const statusUpdateData = {
          id: currentSelectedEvent.id,
          data: {
            status_id: formData.status_id,
            collaborator_id: formData.collaborator_id === "null" ? null : formData.collaborator_id,
            description: formData.description
          }
        };
        
        console.log("Sending status update with data:", statusUpdateData);
        
        // Send the status update
        await updateMutation.mutateAsync(statusUpdateData);
        
        // Add a more visible log to debug the status update
        console.log("STATUS UPDATE COMPLETED SUCCESSFULLY");
        
        toast({
          title: "Status atualizado",
          description: "O status do agendamento foi atualizado com sucesso."
        });
        
        // Call the onSuccess callback if provided
        if (onSuccess) onSuccess();
        
        // Clear cache and refetch to get fresh data
        refetchResources();
        
        // Close the dialog after successful submission
        if (onClose) onClose();
        
      } catch (error: any) {
        console.error("Error updating status:", error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar status",
          description: error?.message || "Não foi possível atualizar o status. Por favor, tente novamente."
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateMutation, onClose, onSuccess, refetchResources, toast]
  );
  
  // Handle delete
  const handleDelete = useCallback(
    async (currentSelectedEvent: CalendarEvent | null) => {
      if (!currentSelectedEvent) {
        console.error("No event selected to delete");
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nenhum agendamento selecionado para excluir."
        });
        return;
      }
      
      try {
        setIsDeleting(true);
        
        console.log("Deleting schedule:", currentSelectedEvent.id);
        // Delete the schedule
        await deleteMutation.mutateAsync(currentSelectedEvent.id);
        
        toast({
          title: "Agendamento excluído",
          description: "O agendamento foi excluído com sucesso."
        });
        
        // Call the onSuccess callback if provided
        if (onSuccess) onSuccess();
        
        // Clear cache and refetch to get fresh data
        refetchResources();
        
        // Close the dialog after successful deletion
        if (onClose) onClose();
        
      } catch (error) {
        console.error("Error deleting schedule:", error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Não foi possível excluir o agendamento. Por favor, tente novamente."
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteMutation, onClose, onSuccess, refetchResources, toast]
  );
  
  return {
    isSubmitting,
    isDeleting,
    handleSubmit,
    handleStatusUpdate,
    handleDelete,
    refetchResources
  };
}
