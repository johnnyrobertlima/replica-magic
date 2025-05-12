
import { useState, useCallback } from "react";
import { useCreateContentSchedule, useUpdateContentSchedule, useDeleteContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
  
  // Get mutation hooks
  const createMutation = useCreateContentSchedule();
  const updateMutation = useUpdateContentSchedule();
  const deleteMutation = useDeleteContentSchedule();

  // Handle form submission (create or update)
  const handleSubmit = useCallback(
    async (e: React.FormEvent, currentSelectedEvent: CalendarEvent | null, formData: ContentScheduleFormData) => {
      e.preventDefault();
      
      try {
        setIsSubmitting(true);
        
        // Convert all Date objects to strings for API
        const apiData = convertDatesToStrings(formData);
        
        // Determine if we're creating or updating
        if (currentSelectedEvent) {
          // Update existing schedule
          await updateMutation.mutateAsync({ 
            id: currentSelectedEvent.id,
            data: apiData as ContentScheduleFormData
          });
        } else {
          // Create new schedule
          await createMutation.mutateAsync(apiData as ContentScheduleFormData);
        }
        
        // Call the onSuccess callback if provided
        if (onSuccess) onSuccess();
        
        // Call the onManualRefetch callback if provided
        if (onManualRefetch) onManualRefetch();
        
        // Close the dialog after successful submission
        if (onClose) onClose();
        
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
    [clientId, selectedDate, createMutation, updateMutation, onClose, onSuccess, onManualRefetch, toast]
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
      if (!formData.status_id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Por favor, selecione um status válido."
        });
        return;
      }
      
      try {
        setIsSubmitting(true);
        
        // Extract only the relevant fields for status update to minimize data being sent
        const updateData: Partial<ContentScheduleFormData> = {
          client_id: formData.client_id,
          service_id: formData.service_id,
          status_id: formData.status_id,
          collaborator_id: formData.collaborator_id,
          description: formData.description,
          title: formData.title
        };
        
        console.log("Sending status update with data:", updateData);
        
        // Create a promise with timeout to prevent infinite loading
        const updatePromise = new Promise<any>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("A solicitação expirou. Por favor, tente novamente."));
          }, 10000); // 10 segundos de timeout
          
          updateMutation.mutateAsync({
            id: currentSelectedEvent.id,
            data: updateData as ContentScheduleFormData
          }).then((result) => {
            clearTimeout(timeoutId);
            resolve(result);
          }).catch((error) => {
            clearTimeout(timeoutId);
            reject(error);
          });
        });
        
        // Wait for the promise to resolve or reject
        await updatePromise;
        
        toast({
          title: "Status atualizado",
          description: "O status do agendamento foi atualizado com sucesso."
        });
        
        // Call the onSuccess callback if provided
        if (onSuccess) onSuccess();
        
        // Call the onManualRefetch callback if provided
        if (onManualRefetch) onManualRefetch();
        
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
    [updateMutation, onClose, onSuccess, onManualRefetch, toast]
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
        
        // Delete the schedule
        await deleteMutation.mutateAsync(currentSelectedEvent.id);
        
        toast({
          title: "Agendamento excluído",
          description: "O agendamento foi excluído com sucesso."
        });
        
        // Call the onSuccess callback if provided
        if (onSuccess) onSuccess();
        
        // Call the onManualRefetch callback if provided
        if (onManualRefetch) onManualRefetch();
        
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
    [deleteMutation, onClose, onSuccess, onManualRefetch, toast]
  );
  
  return {
    isSubmitting,
    isDeleting,
    handleSubmit,
    handleStatusUpdate,
    handleDelete
  };
}
