
import { CalendarEvent } from "@/types/oni-agencia";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventsList } from "./EventsList";

interface ScrollableEventsProps {
  events: CalendarEvent[];
  onEventClick: (e: React.MouseEvent, event: CalendarEvent) => void;
}

export function ScrollableEvents({ events, onEventClick }: ScrollableEventsProps) {
  return (
    <ScrollArea className="h-[calc(100%-20px)]">
      <EventsList events={events} onEventClick={onEventClick} />
    </ScrollArea>
  );
}
