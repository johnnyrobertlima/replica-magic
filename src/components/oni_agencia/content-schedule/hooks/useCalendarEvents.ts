
import { useState, useEffect } from "react";
import { CalendarEvent } from "@/types/oni-agencia";

export function useCalendarEvents(
  events: CalendarEvent[],
  selectedDate: Date | undefined,
  isDialogOpen: boolean,
  setIsDialogOpen: (open: boolean) => void
) {
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>([]);

  // Update the current events whenever the selected date or events change
  useEffect(() => {
    if (!selectedDate) {
      setCurrentEvents([]);
      return;
    }

    const dateString = selectedDate.toISOString().split('T')[0];
    const filteredEvents = events.filter(
      (event) => event.scheduled_date === dateString
    );

    setCurrentEvents(filteredEvents);
  }, [selectedDate, events]);

  return {
    currentEvents
  };
}
