
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

  // Verificar eventos duplicados e garantir que cada evento seja único
  const uniqueEvents = events.reduce<CalendarEvent[]>((acc, event) => {
    // Verificar se já temos esse evento no array
    if (!acc.some(e => e.id === event.id)) {
      acc.push(event);
    }
    return acc;
  }, []);

  return (
    <div className="flex flex-col gap-[2px] pr-2 w-full">
      {uniqueEvents.map((event) => (
        <EventTooltip key={`${event.id}-${date.toISOString()}`} event={event}>
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
