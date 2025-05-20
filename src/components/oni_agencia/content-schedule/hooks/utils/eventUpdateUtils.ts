
import { CalendarEvent } from '@/types/oni-agencia';
import { updateContentSchedule } from '@/services/oniAgenciaContentScheduleServices';
import { format } from 'date-fns';

// Prepare event data for API update
export function prepareEventUpdateData(event: CalendarEvent, newDate: Date) {
  const formattedDate = format(newDate, 'yyyy-MM-dd');
  
  // Only include the essential fields for the update
  const apiData = {
    scheduled_date: formattedDate,
  };

  // Create a complete updated event for optimistic updates
  const updatedEvent = {
    ...event,
    scheduled_date: formattedDate
  };
  
  return {
    apiData,
    updatedEvent
  };
}

// Function to update the scheduled date of an event
export async function updateEventScheduledDate(eventId: string, data: any) {
  try {
    console.log(`Updating event ${eventId} with new date:`, data.scheduled_date);
    
    if (!eventId) {
      throw new Error('Event ID is required for update');
    }
    
    // Make the API call to update the event
    const result = await updateContentSchedule(eventId, data);
    console.log(`Successfully updated event ${eventId}`);
    
    return result;
  } catch (error) {
    console.error(`Failed to update event ${eventId}:`, error);
    throw error;
  }
}
