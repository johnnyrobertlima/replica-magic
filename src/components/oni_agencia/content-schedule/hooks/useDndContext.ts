
import { useCallback } from 'react';
import { format, parse } from 'date-fns';
import { CalendarEvent, ContentScheduleFormData } from '@/types/oni-agencia';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateContentSchedule } from '@/services/oniAgenciaContentScheduleServices';
import { useToast } from '@/hooks/use-toast';

export function useDndContext(clientId: string, events: CalendarEvent[]) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContentScheduleFormData }) => {
      console.log('Updating event via DnD:', id, data);
      return updateContentSchedule(id, data);
    },
    onSuccess: () => {
      console.log('Successfully updated event via DnD');
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      
      toast({
        title: "Event updated",
        description: "Event has been moved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating event via DnD:', error);
      toast({
        variant: "destructive",
        title: "Error updating event",
        description: "Failed to move the event. Please try again.",
      });
    },
  });

  // Function to handle dropping an event on a date
  const handleDropOnDate = useCallback((eventId: string, targetDate: Date) => {
    console.log('Dropping event on date:', eventId, targetDate);
    
    // Find the event in the provided events array
    const eventToUpdate = events.find(event => event.id === eventId);
    
    if (!eventToUpdate) {
      console.error('Event not found:', eventId);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Event not found.",
      });
      return;
    }
    
    const formattedTargetDate = format(targetDate, 'yyyy-MM-dd');
    console.log('Target date formatted:', formattedTargetDate);
    
    // Prepare update object
    const updateData: ContentScheduleFormData = {
      client_id: eventToUpdate.client_id,
      service_id: eventToUpdate.service_id || '',
      collaborator_id: eventToUpdate.collaborator_id,
      title: eventToUpdate.title || '',
      description: eventToUpdate.description,
      scheduled_date: formattedTargetDate, // Update with new date
      execution_phase: eventToUpdate.execution_phase,
      editorial_line_id: eventToUpdate.editorial_line_id,
      product_id: eventToUpdate.product_id,
      status_id: eventToUpdate.status_id,
      creators: eventToUpdate.creators || [],
      capture_date: eventToUpdate.capture_date || null,
      capture_end_date: eventToUpdate.capture_end_date || null,
      is_all_day: eventToUpdate.is_all_day !== null ? eventToUpdate.is_all_day : true,
      location: eventToUpdate.location || null
    };
    
    // Execute the mutation
    updateMutation.mutate({ 
      id: eventId, 
      data: updateData 
    });
  }, [events, updateMutation, toast]);

  return { handleDropOnDate };
}
