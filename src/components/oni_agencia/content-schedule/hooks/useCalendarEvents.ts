
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
    let filteredEvents = events.filter(event => 
      event.scheduled_date === dateString && 
      !(event.status?.name === "Publicado") &&
      !(event.status?.name === "Agendado")
    );
    
    // Verificar eventos duplicados
    filteredEvents = filteredEvents.reduce<CalendarEvent[]>((acc, event) => {
      // Verificar se já temos esse evento no array
      if (!acc.some(e => e.id === event.id)) {
        acc.push(event);
      }
      return acc;
    }, []);
    
    // Apply collaborator filter if provided
    if (selectedCollaborator) {
      filteredEvents = filteredEvents.filter(event => {
        // Check if the person is the main collaborator
        const isCollaborator = event.collaborator_id === selectedCollaborator;
        
        // Check if the person is in the creators array - now with proper direct ID check
        let isCreator = false;
        
        if (event.creators) {
          // Ensure creators is always treated as an array of strings
          const creatorsArray = Array.isArray(event.creators) ? event.creators : 
                               (typeof event.creators === 'string' ? [event.creators] : []);
          
          // Direct ID check - exactly what we need
          isCreator = creatorsArray.includes(selectedCollaborator);
        }
        
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
