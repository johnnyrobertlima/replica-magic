
import { useState } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EventItem } from "../EventItem";

interface MoreEventsIndicatorProps {
  count: number;
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function MoreEventsIndicator({
  count,
  date,
  events,
  onEventClick,
}: MoreEventsIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="events-overflow-indicator text-xs text-muted-foreground w-full py-1 px-1 rounded hover:bg-gray-100 text-center"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          + {count} mais
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-2 events-popover"
        onCloseAutoFocus={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          {events.map((event) => (
            <div 
              key={event.id}
              className="event-item-wrapper rounded hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsOpen(false);
                console.log("MoreEventsIndicator event clicked:", event.id, event.title);
                onEventClick(event);
              }}
              data-event-id={event.id}
            >
              <EventItem
                event={event}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsOpen(false);
                  console.log("MoreEventsIndicator EventItem clicked:", event.id, event.title);
                  onEventClick(event);
                }}
              />
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
