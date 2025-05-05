
import { useState, useEffect } from 'react';
import { CalendarEvent } from "@/types/oni-agencia";

/**
 * Hook to filter events based on collaborator and status
 */
export function useFilteredEvents(
  events: CalendarEvent[] | undefined,
  selectedCollaborator?: string | null
) {
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (!events) {
      setFilteredEvents([]);
      return;
    }
    
    // First, filter out events with "Publicado" and "Agendado" status
    const withoutExcludedStatuses = events.filter(event => 
      !(event.status?.name === "Publicado") &&
      !(event.status?.name === "Agendado")
    );
    
    if (!selectedCollaborator) {
      setFilteredEvents(withoutExcludedStatuses);
      return;
    }
    
    const filtered = withoutExcludedStatuses.filter(event => {
      // Check if the person is the main collaborator
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      
      // Check if the person is in the creators array
      let isCreator = false;
      
      if (event.creators) {
        // Ensure creators is always treated as an array of strings
        const creatorsArray = Array.isArray(event.creators) ? event.creators : 
                             (typeof event.creators === 'string' ? [event.creators] : []);
        
        // Direct ID check
        isCreator = creatorsArray.includes(selectedCollaborator);
      }
      
      // Return true if the person is either a collaborator or a creator
      return isCollaborator || isCreator;
    });
    
    setFilteredEvents(filtered);
  }, [events, selectedCollaborator]);

  return filteredEvents;
}
