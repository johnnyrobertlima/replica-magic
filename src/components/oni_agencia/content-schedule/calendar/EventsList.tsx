
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "../EventItem";
import { DraggableEventItem } from "../DraggableEventItem";
import { EventTooltip } from "./EventTooltip";
import React, { useMemo } from "react";

interface EventsListProps {
  events: CalendarEvent[];
  date: Date;
  onEventClick: (event: CalendarEvent) => void;
  isDraggable?: boolean;
}

export function EventsList({ events, date, onEventClick, isDraggable = true }: EventsListProps) {
  // Utilize useMemo para computações caras como filtragem de eventos
  const uniqueEvents = useMemo(() => {
    if (!events || events.length === 0) return [];
    
    // Remove duplicate events based on ID
    return events.reduce<CalendarEvent[]>((acc, event) => {
      // Only add if not already in the accumulator
      if (!acc.some(e => e.id === event.id)) {
        acc.push(event);
      }
      return acc;
    }, []);
  }, [events]);
  
  if (uniqueEvents.length === 0) return null;

  // Add logs for debugging
  console.log(`Rendering ${uniqueEvents.length} events for date ${date.toISOString().split('T')[0]}`);

  return (
    <div className="flex flex-col gap-[2px] pr-2 w-full">
      {uniqueEvents.map((event) => (
        // Use a truly unique key combining event ID and the ISO date
        <EventTooltip 
          key={`event-${event.id}-${date.toISOString()}`} 
          event={event}
        >
          <div className="event-item-wrapper">
            {isDraggable ? (
              <DraggableEventItem 
                event={event}
                onClick={() => onEventClick(event)}
              />
            ) : (
              <EventItem 
                event={event}
                onClick={() => onEventClick(event)}
              />
            )}
          </div>
        </EventTooltip>
      ))}
    </div>
  );
}
