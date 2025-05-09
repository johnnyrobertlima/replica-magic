
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
    
    // Force dialog to open with a small delay to ensure state updates
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 50);
    
    console.log("Dialog should open now, isDialogOpen will be set to true");
  }, []);
  
  const handleEventClick = useCallback((event: CalendarEvent, date: Date) => {
    console.log("Event clicked in useDateSelection:", event.id, event.title);
    setSelectedDate(date);
    setSelectedEvent(event); // Set the selected event when an event is clicked
    
    // Force dialog to open with a small delay to ensure state updates
    setTimeout(() => {
      setIsDialogOpen(true);
    }, 50);
    
    console.log("Dialog should open now (event click), isDialogOpen will be set to true");
  }, []);
  
  // Add a dedicated method to open dialog
  const openDialog = useCallback(() => {
    console.log("Opening dialog explicitly");
    setIsDialogOpen(true);
  }, []);
  
  // Add a dedicated method to close dialog
  const closeDialog = useCallback(() => {
    console.log("Closing dialog explicitly");
    setIsDialogOpen(false);
  }, []);
  
  return {
    selectedDate,
    selectedEvent,
    isDialogOpen,
    setIsDialogOpen,
    handleDateSelect,
    handleEventClick,
    setSelectedDate,
    setSelectedEvent,
    openDialog,
    closeDialog
  };
}
