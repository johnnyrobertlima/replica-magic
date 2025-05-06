
import { CalendarEvent } from "@/types/oni-agencia";
import { DraggableEventItem } from "../DraggableEventItem";
import React from "react";

interface EventsListProps {
  events: CalendarEvent[];
  date: Date;
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}

export function EventsList({ events, date, onEventClick }: EventsListProps) {
  if (!events || events.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-[2px]">
      {events.map((event) => (
        <DraggableEventItem
          key={event.id}
          event={event}
          onClick={(e) => {
            console.log("EventsList: Event clicked:", event.id);
            e.stopPropagation(); // Prevenir propagação para garantir que o evento seja capturado aqui
            onEventClick(e, event);
          }}
        />
      ))}
    </div>
  );
}
