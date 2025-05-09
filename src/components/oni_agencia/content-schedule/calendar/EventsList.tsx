
import { CalendarEvent } from "@/types/oni-agencia";

interface EventsListProps {
  events: CalendarEvent[];
  date: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function EventsList({ events, date, onEventClick }: EventsListProps) {
  if (!events || events.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-[2px]">
      {events.map((event) => (
        <div 
          key={event.id}
          className="event-item text-xs truncate p-1 rounded bg-primary/10 border-l-2 event-item-wrapper"
          style={{
            borderLeftColor: event.service?.color || '#6366f1'
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent cell click
            onEventClick(event);
          }}
        >
          <div className="truncate font-medium">{event.title}</div>
          {event.service && (
            <div className="truncate text-[10px] text-muted-foreground">
              {event.service.name}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
