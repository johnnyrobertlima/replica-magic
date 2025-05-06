
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "../EventItem";
import { DraggableEventItem } from "../DraggableEventItem";
import { EventTooltip } from "./EventTooltip";

interface EventsListProps {
  events: CalendarEvent[];
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
  isDraggable?: boolean;
}

export function EventsList({ events, onEventClick, isDraggable = true }: EventsListProps) {
  return (
    <div className="flex flex-col gap-[2px] pr-2">
      {events.map((event) => (
        <EventTooltip key={event.id} event={event}>
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
