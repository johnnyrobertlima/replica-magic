
import { useState } from "react";
import { CalendarEvent } from "@/types/oni-agencia";

export function useDateSelection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedEvent(undefined); // Clear event selection when selecting a date
  };
  
  const handleEventClick = (event: CalendarEvent, date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(event);
  };
  
  return {
    selectedDate,
    selectedEvent,
    handleDateSelect,
    handleEventClick,
    setSelectedDate,
    setSelectedEvent
  };
}
