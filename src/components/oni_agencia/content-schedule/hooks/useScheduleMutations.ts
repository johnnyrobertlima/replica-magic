
import { useState, useCallback } from "react";
import { useCreateContentSchedule, useUpdateContentSchedule, useDeleteContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { format } from "date-fns";

// Update the interface to include onSuccess and onManualRefetch
interface UseScheduleMutationsProps {
  clientId: string;
  selectedDate: Date;
  onClose?: () => void;
  onSuccess?: () => void;
  onManualRefetch?: () => void;
}

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
        
        // Format the date as YYYY-MM-DD
        const scheduledDate = format(selectedDate, "yyyy-MM-dd");
        
        // Create the final data to submit
        const dataToSubmit: ContentScheduleFormData = {
          ...formData,
          scheduled_date: scheduledDate
        };
        
        // Determine if we're creating or updating
        if (currentSelectedEvent) {
          // Update existing schedule
          await updateMutation.mutateAsync({ 
            id: currentSelectedEvent.id,
            data: dataToSubmit
          });
        } else {
          // Create new schedule
          await createMutation.mutateAsync(dataToSubmit);
        }
        
        // Call the onSuccess callback if provided
        if (onSuccess) onSuccess();
        
        // Call the onManualRefetch callback if provided
        if (onManualRefetch) onManualRefetch();
        
        // Close the dialog after successful submission
        if (onClose) onClose();
        
      } catch (error) {
        console.error("Error submitting content schedule:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [clientId, selectedDate, createMutation, updateMutation, onClose, onSuccess, onManualRefetch]
  );
  
  // Handle status update
  const handleStatusUpdate = useCallback(
    async (e: React.FormEvent, currentSelectedEvent: CalendarEvent | null, formData: ContentScheduleFormData) => {
      e.preventDefault();
      
      try {
        if (!currentSelectedEvent) {
          console.error("No event selected");
          return;
        }
        
        setIsSubmitting(true);
        
        // Only update the status and collaborator
        const dataToUpdate = {
          ...currentSelectedEvent,
          status_id: formData.status_id,
          collaborator_id: formData.collaborator_id,
          description: formData.description
        };
        
        // Update the status
        await updateMutation.mutateAsync({
          id: currentSelectedEvent.id,
          data: dataToUpdate
        });
        
        // Call the onSuccess callback if provided
        if (onSuccess) onSuccess();
        
        // Call the onManualRefetch callback if provided
        if (onManualRefetch) onManualRefetch();
        
        // Close the dialog after successful submission
        if (onClose) onClose();
        
      } catch (error) {
        console.error("Error updating status:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [updateMutation, onClose, onSuccess, onManualRefetch]
  );
  
  // Handle delete
  const handleDelete = useCallback(
    async (currentSelectedEvent: CalendarEvent | null) => {
      if (!currentSelectedEvent) {
        console.error("No event selected to delete");
        return;
      }
      
      try {
        setIsDeleting(true);
        
        // Delete the schedule
        await deleteMutation.mutateAsync(currentSelectedEvent.id);
        
        // Call the onSuccess callback if provided
        if (onSuccess) onSuccess();
        
        // Call the onManualRefetch callback if provided
        if (onManualRefetch) onManualRefetch();
        
        // Close the dialog after successful deletion
        if (onClose) onClose();
        
      } catch (error) {
        console.error("Error deleting schedule:", error);
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteMutation, onClose, onSuccess, onManualRefetch]
  );
  
  return {
    isSubmitting,
    isDeleting,
    handleSubmit,
    handleStatusUpdate,
    handleDelete
  };
}
