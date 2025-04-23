
import { useMemo } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { format } from "date-fns";

export function useCalendarEvents(
  events: CalendarEvent[],
  selectedDate: Date | undefined,
  isDialogOpen: boolean,
  setIsDialogOpen: (open: boolean) => void,
  selectedCollaborator?: string | null
) {
  // Memo for events on the selected date
  const currentEvents = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    // Filter events for the selected date
    let filteredEvents = events.filter(event => event.scheduled_date === dateString);
    
    // Apply collaborator filter if provided
    if (selectedCollaborator) {
      filteredEvents = filteredEvents.filter(event => {
        // Check if the person is a collaborator
        const isCollaborator = event.collaborator_id === selectedCollaborator;
        
        // Check if the person is in the creators array - with better handling of creators
        const creators = Array.isArray(event.creators) ? 
          event.creators : 
          (typeof event.creators === 'string' ? 
            [event.creators] : 
            []);
            
        const isCreator = creators.includes(selectedCollaborator);
        
        // Return true if the person is either a collaborator or a creator
        return isCollaborator || isCreator;
      });
    }
    
    return filteredEvents;
  }, [selectedDate, events, selectedCollaborator]);
  
  return {
    currentEvents
  };
}
