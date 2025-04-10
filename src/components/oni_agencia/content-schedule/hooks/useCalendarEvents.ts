
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";

export function useCalendarEvents(events: CalendarEvent[], selectedDate: Date | undefined) {
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Atualiza eventos atuais quando a data selecionada muda
  useEffect(() => {
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      const eventsOnDay = events.filter(event => {
        const eventDate = event.scheduled_date;
        return eventDate === dateString;
      });
      
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
