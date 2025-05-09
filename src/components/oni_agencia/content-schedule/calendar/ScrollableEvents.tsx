
import { CalendarEvent } from "@/types/oni-agencia";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventsList } from "./EventsList";

interface ScrollableEventsProps {
  events: CalendarEvent[];
  date: Date;
  onEventClick: (event: CalendarEvent) => void;
}

export function ScrollableEvents({ events, date, onEventClick }: ScrollableEventsProps) {
  if (!events || events.length === 0) return null;
  
  return (
    <ScrollArea className="h-[calc(100%-20px)]">
      <EventsList events={events} date={date} onEventClick={onEventClick} />
    </ScrollArea>
  );
}
