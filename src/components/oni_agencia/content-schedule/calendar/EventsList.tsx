
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "../EventItem";

interface EventsListProps {
  events: CalendarEvent[];
  date: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function EventsList({ events, date, onEventClick }: EventsListProps) {
  return (
    <div className="flex flex-col gap-1">
      {events.map((event) => (
        <div 
          key={event.id} 
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
