
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "../EventItem";
import { useMemo } from "react";

interface EventsListProps {
  events: CalendarEvent[];
  date: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function EventsList({ events, date, onEventClick }: EventsListProps) {
  // Ensure events is always an array and deduplicate by ID
  const deduplicatedEvents = useMemo(() => {
    if (!Array.isArray(events)) {
      console.warn("EventsList received non-array events:", events);
      return [];
    }
    
    // Filter out events without IDs
    const validEvents = events.filter(event => !!event?.id);
    
    // Create a map to deduplicate by ID
    const eventMap = new Map();
    validEvents.forEach(event => {
      if (!eventMap.has(event.id)) {
        eventMap.set(event.id, event);
      }
    });
    
    return Array.from(eventMap.values());
  }, [events]);
  
  // Get the date string for consistent key generation
  const dateString = date.toISOString().split('T')[0];
  
  return (
    <div className="flex flex-col gap-1">
      {deduplicatedEvents.map((event) => (
        <div 
          key={`event-${event.id}-${dateString}`}
          className="event-item-wrapper"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onEventClick(event);
          }}
          data-event-id={event.id}
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <EventItem
            event={event}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onEventClick(event);
            }}
          />
        </div>
      ))}
    </div>
  );
}
