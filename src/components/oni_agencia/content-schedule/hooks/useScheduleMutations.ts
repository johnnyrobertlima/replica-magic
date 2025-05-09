
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

// Helper function to convert Date objects to strings for API
const convertDatesToStrings = (data: ContentScheduleFormData) => {
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
            data: apiData
          });
        } else {
          // Create new schedule
          await createMutation.mutateAsync(apiData);
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
        
        // Only update the status, collaborator and description
        // We need to ensure these are properly formatted for the API
        const apiData = convertDatesToStrings({
          ...currentSelectedEvent,
          status_id: formData.status_id,
          collaborator_id: formData.collaborator_id,
          description: formData.description
        } as ContentScheduleFormData);
        
        // Update the status
        await updateMutation.mutateAsync({
          id: currentSelectedEvent.id,
          data: apiData
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
