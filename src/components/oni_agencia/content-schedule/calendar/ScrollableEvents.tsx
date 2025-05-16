
import { CalendarEvent } from "@/types/oni-agencia";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventItem } from "../EventItem";

interface ScrollableEventsProps {
  events: CalendarEvent[];
  date: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function ScrollableEvents({ events, date, onEventClick }: ScrollableEventsProps) {
  return (
    <ScrollArea className="h-[calc(100%-20px)] w-full event-scroll-area">
      <div className="flex flex-col gap-1 p-1">
        {events.map((event) => (
          <div 
            key={event.id} 
            className="event-item-wrapper mb-1 hover:bg-gray-100 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              console.log("ScrollableEvents event clicked:", event.id, event.title);
              onEventClick(event);
            }}
            data-event-id={event.id}
          >
            <EventItem
              event={event}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log("ScrollableEvents EventItem clicked:", event.id, event.title);
                onEventClick(event);
              }}
            />
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
