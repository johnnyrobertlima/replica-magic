
import { useState, useEffect } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { format } from "date-fns";

export function useCalendarEvents(
  events: CalendarEvent[],
  selectedDate: Date | undefined,
  isDialogOpen: boolean,
  setIsDialogOpen: (open: boolean) => void
) {
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>([]);
  
  // Update events for the selected date when date changes or dialog opens
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const eventsForDate = events.filter(event => event.scheduled_date === dateString);
      
      console.log(`Found ${eventsForDate.length} events for date ${dateString}`);
      setCurrentEvents(eventsForDate);
    } else {
      setCurrentEvents([]);
    }
  }, [selectedDate, events, isDialogOpen]);
  
  return {
    currentEvents
  };
}
