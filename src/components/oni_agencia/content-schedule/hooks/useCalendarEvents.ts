
import { useState, useMemo, useCallback } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { format, isSameDay } from "date-fns";

export function useCalendarEvents(events: CalendarEvent[], selectedDate?: Date, isDialogOpen: boolean = false, setIsDialogOpen?: (open: boolean) => void) {
  // Use the filtered events for the selected date
  const currentEvents = useMemo(() => {
    if (!selectedDate) return [];
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return events.filter((event) => event.scheduled_date === dateString);
  }, [events, selectedDate]);

  // Function to open the dialog programmatically
  const openDialog = useCallback(() => {
    console.log("Attempting to open dialog, current state:", { isDialogOpen, hasSetIsDialogOpen: !!setIsDialogOpen });
    if (setIsDialogOpen) {
      setIsDialogOpen(true);
    }
  }, [isDialogOpen, setIsDialogOpen]);

  return {
    currentEvents,
    isDialogOpen: isDialogOpen || false,
    setIsDialogOpen: setIsDialogOpen || (() => {
      console.log("Warning: setIsDialogOpen not provided to useCalendarEvents");
    }),
    openDialog
  };
}
