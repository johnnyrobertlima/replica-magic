
import { useState } from "react";
import { CalendarEvent } from "@/types/oni-agencia";

export function useDateSelection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleDateSelect = (date: Date | undefined) => {
    console.log("Date selected:", date);
    setSelectedDate(date);
    setSelectedEvent(undefined); // Clear event selection when selecting a date
    setIsDialogOpen(true); // Open dialog when a date is selected
  };
  
  const handleEventClick = (event: CalendarEvent, date: Date) => {
    console.log("Event clicked:", event.id, event.title);
    setSelectedDate(date);
    setSelectedEvent(event);
    setIsDialogOpen(true); // Open dialog when an event is clicked
  };
  
  return {
    selectedDate,
    selectedEvent,
    isDialogOpen,
    setIsDialogOpen,
    handleDateSelect,
    handleEventClick,
    setSelectedDate,
    setSelectedEvent
  };
}
