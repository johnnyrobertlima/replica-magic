
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "../EventItem";
import { DraggableEventItem } from "../DraggableEventItem";
import { EventTooltip } from "./EventTooltip";
import React, { useMemo, memo } from "react";

interface EventsListProps {
  events: CalendarEvent[];
  date: Date;
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
  isDraggable?: boolean;
}

export const EventsList = memo(function EventsList({ 
  events, 
  date, 
  onEventClick, 
  isDraggable = true 
}: EventsListProps) {
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

  console.log(`EventsList - Rendering ${uniqueEvents.length} events for date ${date.toISOString().split('T')[0]}`);

  return (
    <div className="flex flex-col gap-0 pr-2 w-full">
      {uniqueEvents.map((event) => {
        const eventClickHandler = (e: React.MouseEvent) => {
          console.log(`EventsList - Event clicked: ${event.id}`);
          onEventClick(e, event);
        };
        
        const key = `event-${event.id}-${date.toISOString()}`;
        
        return (
          <EventTooltip 
            key={key} 
            event={event}
          >
            <div className="event-item-wrapper">
              {isDraggable ? (
                <DraggableEventItem 
                  event={event}
                  onClick={eventClickHandler}
                />
              ) : (
                <EventItem 
                  event={event}
                  onClick={eventClickHandler}
                />
              )}
            </div>
          </EventTooltip>
        );
      })}
    </div>
  );
});
