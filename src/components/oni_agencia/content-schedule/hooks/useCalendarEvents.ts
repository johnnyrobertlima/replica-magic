
import { useState, useMemo } from "react";
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
  const openDialog = () => {
    if (setIsDialogOpen) {
      setIsDialogOpen(true);
    }
  };

  return {
    currentEvents,
    isDialogOpen: isDialogOpen || false,
    setIsDialogOpen: setIsDialogOpen || (() => {}),
    openDialog
  };
}
