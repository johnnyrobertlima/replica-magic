
import { useState, useCallback } from 'react';
import { CalendarEvent } from '@/types/oni-agencia';

export function useDateSelection() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDateSelect = useCallback((date: Date) => {
    console.log("Date selected:", date);
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setIsDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent, date: Date) => {
    console.log("Event clicked:", event.id, "on date:", date);
    setSelectedEvent(event);
    setSelectedDate(date);
    setIsDialogOpen(true);
  }, []);

  return {
    selectedDate,
    setSelectedDate,
    selectedEvent,
    setSelectedEvent,
    isDialogOpen,
    setIsDialogOpen,
    handleDateSelect,
    handleEventClick
  };
}
