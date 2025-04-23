
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
        
        // Process creators to ensure we're working with a proper array
        let creators: string[] = [];
        
        if (event.creators) {
          if (Array.isArray(event.creators)) {
            creators = event.creators;
          } else if (typeof event.creators === 'string') {
            try {
              const parsedCreators = JSON.parse(event.creators);
              creators = Array.isArray(parsedCreators) ? parsedCreators : [parsedCreators];
            } catch (e) {
              creators = [event.creators];
            }
          } else {
            creators = [];
          }
        }
        
        // Check if the person is in the creators array
        const isCreator = creators.includes(selectedCollaborator);
        
        // Add debug logging for better visibility
        if (event.title === "teste" || event.title === " ") {
          console.log("useCalendarEvents filtering:", {
            eventTitle: event.title,
            collaborator_id: event.collaborator_id,
            creators,
            selectedCollaborator,
            isCollaborator,
            isCreator,
            shouldShow: isCollaborator || isCreator
          });
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
