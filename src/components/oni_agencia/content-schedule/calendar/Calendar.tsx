
import { useState, useCallback, useEffect } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarContainer } from "./CalendarContainer";
import { ScheduleEventDialog } from "../ScheduleEventDialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CalendarEvent } from "@/types/oni-agencia";

interface CalendarProps {
  events: CalendarEvent[];
  month: number;
  year: number;
  clientId: string;
  selectedCollaborator?: string | null;
  onMonthYearChange: (month: number, year: number) => void;
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
  selectedDate?: Date;
  selectedEvent?: CalendarEvent;
  isDialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  onDialogClose: () => void;
  onManualRefetch?: () => void;
}

export function Calendar({
  events,
  month,
  year,
  clientId,
  selectedCollaborator,
  onMonthYearChange,
  onDateSelect,
  onEventClick,
  selectedDate,
  selectedEvent,
  isDialogOpen,
  onDialogOpenChange,
  onDialogClose,
  onManualRefetch
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(year, month - 1, 1));
  const isMobile = useMediaQuery("(max-width: 767px)");
  
  const handleMonthChange = useCallback((increment: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
    
    const newMonth = newDate.getMonth() + 1;
    const newYear = newDate.getFullYear();
    onMonthYearChange(newMonth, newYear);
  }, [currentDate, onMonthYearChange]);
  
  // Make sure currentDate is updated when month/year props change
  useEffect(() => {
    const propsDate = new Date(year, month - 1, 1);
    if (propsDate.getMonth() !== currentDate.getMonth() || propsDate.getFullYear() !== currentDate.getFullYear()) {
      setCurrentDate(propsDate);
    }
  }, [month, year]);
  
  // Filter events that fall within the displayed month
  const filteredEvents = events.filter(event => {
    if (!event.scheduled_date) return false;
    
    const eventDate = new Date(event.scheduled_date);
    return eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
  });
  
  // Log the number of events being displayed for debugging
  console.log(`Calendar - Displaying ${filteredEvents.length} events for ${month}/${year}`);
  
  if (selectedEvent) {
    console.log("Calendar - Selected event:", selectedEvent.id, selectedEvent.title);
  }
  
  return (
    <div className="bg-white rounded-md border shadow-sm w-full h-full">
      <CalendarHeader 
        currentDate={currentDate}
        onPrevMonth={() => handleMonthChange(-1)}
        onNextMonth={() => handleMonthChange(1)}
      />
      
      <CalendarContainer
        events={filteredEvents}
        selectedDate={selectedDate}
        currentDate={currentDate}
        selectedCollaborator={selectedCollaborator}
        onSelect={onDateSelect}
        onEventClick={onEventClick}
      />
      
      {selectedDate && (
        <ScheduleEventDialog
          isOpen={isDialogOpen}
          onOpenChange={onDialogOpenChange}
          clientId={clientId}
          selectedDate={selectedDate}
          events={filteredEvents.filter(e => e.scheduled_date === selectedDate.toISOString().split('T')[0])}
          onClose={onDialogClose}
          selectedEvent={selectedEvent}
          onManualRefetch={onManualRefetch}
        />
      )}
    </div>
  );
}
