
import { useState, useCallback, useEffect } from 'react';
import { CalendarEvent } from '@/types/oni-agencia';
import { format } from 'date-fns';

export function useDateSelection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDateSelect = useCallback((date: Date) => {
    console.log("Date selected in useDateSelection:", date);
    setSelectedDate(date);
    setSelectedEvent(undefined);  // Clear any previously selected event
    setIsDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent, date: Date) => {
    console.log("Event clicked in useDateSelection:", event.id, event.title);
    setSelectedEvent(event);
    setSelectedDate(date);
    setIsDialogOpen(true);
  }, []);

  const openDialog = useCallback(() => {
    console.log("Opening dialog in useDateSelection");
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    console.log("Closing dialog in useDateSelection");
    setIsDialogOpen(false);
  }, []);

  // Debug: watch for changes in selected date
  useEffect(() => {
    if (selectedDate) {
      console.log(`Selected date in useDateSelection: ${format(selectedDate, 'yyyy-MM-dd')}`);
    }
  }, [selectedDate]);

  // Debug: watch for changes in dialog state
  useEffect(() => {
    if (selectedDate) {
      console.log(`Dialog should be ${isDialogOpen ? 'open' : 'closed'} now, isDialogOpen was set to ${isDialogOpen}`);
    }
  }, [isDialogOpen, selectedDate]);

  return {
    selectedDate,
    selectedEvent,
    isDialogOpen,
    setIsDialogOpen,
    setSelectedDate,
    setSelectedEvent,
    handleDateSelect,
    handleEventClick,
    openDialog,
    closeDialog
  };
}
