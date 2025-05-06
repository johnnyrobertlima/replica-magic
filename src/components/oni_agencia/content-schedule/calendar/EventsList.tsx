
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "../EventItem";
import { DraggableEventItem } from "../DraggableEventItem";
import { EventTooltip } from "./EventTooltip";
import React from "react";

interface EventsListProps {
  events: CalendarEvent[];
  date: Date;
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
  isDraggable?: boolean;
}

export function EventsList({ events, date, onEventClick, isDraggable = true }: EventsListProps) {
  if (!events || events.length === 0) return null;

  // Remove duplicate events based on ID
  const uniqueEvents = events.reduce<CalendarEvent[]>((acc, event) => {
    // Only add if not already in the accumulator
    if (!acc.some(e => e.id === event.id)) {
      acc.push(event);
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-[2px] pr-2 w-full">
      {uniqueEvents.map((event) => (
        // Use a truly unique key by combining event ID and the ISO date string
        <EventTooltip 
          key={`event-${event.id}-${date.toISOString()}`} 
          event={event}
        >
          <div className="event-item-wrapper">
            {isDraggable ? (
              <DraggableEventItem 
                event={event}
                onClick={(e) => onEventClick(e, event)}
              />
            ) : (
              <EventItem 
                event={event}
                onClick={(e) => onEventClick(e, event)}
              />
            )}
          </div>
        </EventTooltip>
      ))}
    </div>
  );
}
