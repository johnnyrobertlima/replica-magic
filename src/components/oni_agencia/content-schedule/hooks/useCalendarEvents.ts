
import { useMemo } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { format } from "date-fns";

export function useCalendarEvents(
  events: CalendarEvent[],
  selectedDate: Date | undefined,
  isDialogOpen: boolean,
  setIsDialogOpen: (open: boolean) => void
) {
  // Use useMemo para calcular eventos para a data selecionada de forma otimizada
  const currentEvents = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return events.filter(event => event.scheduled_date === dateString);
  }, [selectedDate, events]);
  
  return {
    currentEvents
  };
}
