
import { useState, useCallback, useRef, useEffect } from "react";
import { CalendarEvent } from "@/types/oni-agencia";

export function useDateSelection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isProcessingRef = useRef(false);
  
  // Reset processing flag when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      isProcessingRef.current = false;
    }
  }, [isDialogOpen]);
  
  const handleDateSelect = useCallback((date: Date | undefined) => {
    // Previne múltiplas chamadas durante o mesmo ciclo de seleção
    if (isProcessingRef.current) {
      console.log("Ignorando chamada duplicada de handleDateSelect");
      return;
    }
    
    console.log("Date selected in useDateSelection:", date);
    isProcessingRef.current = true;
    
    setSelectedDate(date);
    
    // Always clear event selection when selecting a date directly
    // This is crucial to ensure we're creating a new event, not editing
    setSelectedEvent(undefined);
    
    // Force dialog to open
    setIsDialogOpen(true);
    
    console.log("Dialog should open now, isDialogOpen was set to true");
  }, []);
  
  const handleEventClick = useCallback((event: CalendarEvent, date: Date) => {
    // Previne múltiplas chamadas durante o mesmo ciclo de seleção
    if (isProcessingRef.current) {
      console.log("Ignorando chamada duplicada de handleEventClick");
      return;
    }
    
    console.log("Event clicked in useDateSelection:", event.id, event.title);
    isProcessingRef.current = true;
    
    setSelectedDate(date);
    setSelectedEvent(event); // Set the selected event when an event is clicked
    
    // Force dialog to open
    setIsDialogOpen(true);
    
    console.log("Dialog should open now (event click), isDialogOpen was set to true");
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
