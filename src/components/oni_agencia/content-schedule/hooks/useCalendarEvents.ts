
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
    
    // Filter events for the selected date and remove "Publicado" and "Agendado" status events
    const filteredByDate = events.filter(event => 
      event.scheduled_date === dateString && 
      !(event.status?.name === "Publicado") &&
      !(event.status?.name === "Agendado")
    );
    
    // Ensure we have no duplicate events
    const uniqueEvents = filteredByDate.reduce<CalendarEvent[]>((acc, event) => {
      // Check if this event ID is already in the accumulator
      if (!acc.some(e => e.id === event.id)) {
        acc.push(event);
      }
      return acc;
    }, []);
    
    // Apply collaborator filter if provided
    if (selectedCollaborator) {
      return uniqueEvents.filter(event => {
        // Check if the person is the main collaborator
        const isCollaborator = event.collaborator_id === selectedCollaborator;
        
        // Check if the person is in the creators array
        const isCreator = event.creators?.includes(selectedCollaborator) || false;
        
        // Return true if the person is either a collaborator or a creator
        return isCollaborator || isCreator;
      });
    }
    
    return uniqueEvents;
  }, [selectedDate, events, selectedCollaborator]);
  
  return {
    currentEvents
  };
}
