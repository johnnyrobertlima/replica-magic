
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "../EventItem";

interface EventsListProps {
  events: CalendarEvent[];
  date: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function EventsList({ events, date, onEventClick }: EventsListProps) {
  // Garantir que não temos eventos duplicados baseados no ID
  const uniqueEvents = Array.isArray(events) ? 
    events.reduce<Record<string, CalendarEvent>>((acc, event) => {
      if (!event.id) return acc;
      // Se o evento já existe no acumulador, não adicionar novamente
      if (!acc[event.id]) {
        acc[event.id] = event;
      }
      return acc;
    }, {}) : {};

  const deduplicatedEvents = Object.values(uniqueEvents);
  
  // Adicionar logs para debug
  console.log(`EventsList rendering ${deduplicatedEvents.length} events for date ${date.toISOString().split('T')[0]}`);
  
  return (
    <div className="flex flex-col gap-1">
      {deduplicatedEvents.map((event) => (
        <div 
          key={`${event.id}-${date.toISOString().split('T')[0]}`} 
          className="event-item-wrapper"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log("Event clicked:", event.id, event.title);
            onEventClick(event);
          }}
          data-event-id={event.id}
        >
          <EventItem
            event={event}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("EventItem clicked:", event.id, event.title);
              onEventClick(event);
            }}
          />
        </div>
      ))}
    </div>
  );
}
