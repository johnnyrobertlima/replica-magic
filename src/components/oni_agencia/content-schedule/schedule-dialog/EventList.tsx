
import React from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventListProps {
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}

export function EventList({ events, onSelectEvent }: EventListProps) {
  if (!events || events.length === 0) {
    return <div className="p-4 text-center text-gray-500">No events for this day</div>;
  }

  return (
    <ScrollArea className="h-64">
      <div className="px-4 space-y-2">
        {events.map((event) => (
          <Button
            key={event.id}
            variant="outline"
            className="w-full flex justify-start text-left overflow-hidden"
            onClick={() => onSelectEvent(event)}
          >
            <span className="truncate">{event.title || "Unnamed event"}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
