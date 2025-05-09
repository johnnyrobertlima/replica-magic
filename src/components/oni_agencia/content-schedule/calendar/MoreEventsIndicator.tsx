
import { CalendarEvent } from "@/types/oni-agencia";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EventsList } from "./EventsList";

interface MoreEventsIndicatorProps {
  count: number;
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function MoreEventsIndicator({ count, date, events, onEventClick }: MoreEventsIndicatorProps) {
  if (count <= 0) return null;
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full text-xs text-muted-foreground bg-muted/50 py-0.5 rounded-sm events-overflow-indicator">
          + {count} mais
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-64" align="start">
        <div className="p-2 bg-white">
          <EventsList 
            events={events} 
            date={date} 
            onEventClick={onEventClick} 
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
