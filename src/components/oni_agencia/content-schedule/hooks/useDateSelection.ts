
import { useState, useCallback, useRef, useEffect } from "react";
import { CalendarEvent } from "@/types/oni-agencia";

export function useDateSelection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isProcessingRef = useRef(false);
  const selectedEventIdRef = useRef<string | null>(null);
  
  // Reset processing flag when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      isProcessingRef.current = false;
      selectedEventIdRef.current = null;
    }
  }, [isDialogOpen]);
  
  const handleDateSelect = useCallback((date: Date | undefined) => {
    // Prevent multiple calls during the same selection cycle
    if (isProcessingRef.current) {
      console.log("Ignoring duplicate call to handleDateSelect");
      return;
    }
    
    console.log("Date selected in useDateSelection:", date);
    isProcessingRef.current = true;
    
    setSelectedDate(date);
    
    // Always clear event selection when selecting a date directly
    // This is crucial to ensure we're creating a new event, not editing
    setSelectedEvent(undefined);
    selectedEventIdRef.current = null;
    
    // Force dialog to open with a small delay to ensure state updates properly
    setTimeout(() => {
      setIsDialogOpen(true);
      console.log("Dialog should be open now, isDialogOpen was set to true");
    }, 100);
  }, []);
  
  const handleEventClick = useCallback((event: CalendarEvent, date: Date) => {
    // Prevent multiple calls during the same selection cycle
    if (isProcessingRef.current) {
      console.log("Ignoring duplicate call to handleEventClick");
      return;
    }
    
    // Prevent selecting the same event twice
    if (selectedEventIdRef.current === event.id) {
      console.log("Ignoring duplicate event selection:", event.id);
      return;
    }
    
    console.log("Event clicked in useDateSelection:", event.id, event.title);
    isProcessingRef.current = true;
    selectedEventIdRef.current = event.id;
    
    // Create a slight delay to ensure we don't get multiple rapid selections
    setTimeout(() => {
      setSelectedDate(date);
      setSelectedEvent(event); // Set the selected event when an event is clicked
      
      // Force dialog to open with a small delay to ensure state updates properly
      setTimeout(() => {
        setIsDialogOpen(true);
        console.log("Dialog should be open now (event click), isDialogOpen was set to true");
      }, 50);
    }, 10);
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
    // Reset processing flag on dialog close
    isProcessingRef.current = false;
    selectedEventIdRef.current = null;
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
