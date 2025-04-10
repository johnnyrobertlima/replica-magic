
import { useState, useEffect } from "react";
import { format, isSameDay } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";

export function useCalendarEvents(events: CalendarEvent[], selectedDate: Date | undefined) {
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Update current events when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      console.log("Looking for events on:", dateString);
      console.log("Available events:", events);
      
      const eventsOnDay = events.filter(event => {
        const eventDate = event.scheduled_date;
        return eventDate === dateString;
      });
      
      console.log("Events found for selected day:", eventsOnDay);
      setCurrentEvents(eventsOnDay);
    } else {
      setCurrentEvents([]);
    }
  }, [selectedDate, events]);

  return {
    currentEvents,
    isDialogOpen,
    setIsDialogOpen,
    openDialog: () => setIsDialogOpen(true),
    closeDialog: () => setIsDialogOpen(false)
  };
}
