
import { format, isSameDay, isToday, getDay, isSameMonth } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventsList } from "./EventsList";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface CalendarDayProps {
  date: Date;
  events: CalendarEvent[];
  selectedDate?: Date;
  onSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
  selectedCollaborator?: string | null;
  useCaptureDate?: boolean;
}

export function CalendarDay({
  date,
  events,
  selectedDate,
  onSelect,
  onEventClick,
  selectedCollaborator,
  useCaptureDate = false
}: CalendarDayProps) {
  const isCurrentDay = isToday(date);
  const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
  const isInCurrentMonth = isSameMonth(date, selectedDate || new Date());
  const dayOfWeek = getDay(date);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Filter events for this day based on useCaptureDate flag
  const dayEvents = useMemo(() => {
    const dateStr = format(date, "yyyy-MM-dd");
    
    if (useCaptureDate) {
      // Filter by capture_date when useCaptureDate is true
      return events.filter((event) => {
        if (!event.capture_date) return false;
        return event.capture_date.split('T')[0] === dateStr;
      });
    } else {
      // Filter by scheduled_date (original behavior)
      return events.filter((event) => event.scheduled_date === dateStr);
    }
  }, [date, events, useCaptureDate]);
  
  // Further filter by selectedCollaborator if specified
  const filteredEvents = useMemo(() => {
    if (!selectedCollaborator) return dayEvents;
    
    return dayEvents.filter((event) => {
      // Check if collaborator is assigned to the event
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      
      // Check if collaborator is part of the creators array
      const isCreator = event.creators?.includes(selectedCollaborator) || false;
      
      return isCollaborator || isCreator;
    });
  }, [dayEvents, selectedCollaborator]);

  // Debug log for number of events
  const day = date.getDate();
  const dayOfMonth = format(date, 'd');
  
  return (
    <div
      className={cn(
        "border border-gray-200 min-h-[120px] p-1 relative",
        isInCurrentMonth ? "bg-white" : "bg-gray-50",
        isWeekend ? "bg-gray-50" : "",
        isSelected ? "bg-blue-50 border-blue-300" : "",
        isCurrentDay ? "border-primary" : ""
      )}
      onClick={() => onSelect(date)}
    >
      <div 
        className={cn(
          "flex items-center justify-center w-7 h-7 mb-1 rounded-full",
          isCurrentDay ? "bg-primary text-white" : "",
          isSelected && !isCurrentDay ? "bg-blue-200" : ""
        )}
      >
        {dayOfMonth}
      </div>
      <EventsList 
        events={filteredEvents} 
        onEventClick={(event) => onEventClick(event, date)} 
      />
    </div>
  );
}
