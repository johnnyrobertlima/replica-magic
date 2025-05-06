
import { useState, useCallback } from "react";
import { CalendarEvent } from "@/types/oni-agencia";

export function useDateSelection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log("Date selected in useDateSelection:", date);
    setSelectedDate(date);
    
    // Always clear event selection when selecting a date directly
    // This is crucial to ensure we're creating a new event, not editing
    setSelectedEvent(undefined);
    
    setIsDialogOpen(true); // Open dialog when a date is selected
  }, []);
  
  const handleEventClick = useCallback((event: CalendarEvent, date: Date) => {
    console.log("Event clicked in useDateSelection:", event.id, event.title);
    setSelectedDate(date);
    setSelectedEvent(event); // Set the selected event when an event is clicked
    setIsDialogOpen(true); // Open dialog when an event is clicked
  }, []);
  
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
