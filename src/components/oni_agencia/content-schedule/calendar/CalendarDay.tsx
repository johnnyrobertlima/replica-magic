
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
    if (!Array.isArray(events)) return [];
    
    const dateStr = format(date, "yyyy-MM-dd");
    let filteredEvents = [];
    
    if (useCaptureDate) {
      // Filter by capture_date when useCaptureDate is true
      filteredEvents = events.filter((event) => {
        if (!event?.capture_date) return false;
        
        // Debug log to see what capture_date looks like
        console.log(`Event ${event.id} capture_date: ${event.capture_date}`);
        
        // Extract only the date part (without the hour) from capture_date
        const captureDateOnly = event.capture_date.split('T')[0];
        console.log(`Comparing ${captureDateOnly} with ${dateStr} for event ${event.id}`);
        
        // Return true if the date matches - REMOVED status filter
        return captureDateOnly === dateStr;
      });
      
      console.log(`Date ${dateStr} - Found ${filteredEvents.length} events with capture_date`);
    } else {
      // Filter by scheduled_date (original behavior)
      filteredEvents = events.filter((event) => {
        return event?.scheduled_date === dateStr;
      });
    }
    
    // Deduplicate events by ID
    const uniqueEvents = filteredEvents.reduce<Record<string, CalendarEvent>>((acc, event) => {
      if (event?.id) {
        acc[event.id] = event;
      }
      return acc;
    }, {});
    
    return Object.values(uniqueEvents);
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

  // Debug log for events
  const dateStr = format(date, 'yyyy-MM-dd');
  console.log(`CalendarDay ${dateStr} has ${filteredEvents.length} events after filtering`);
  
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
        {format(date, 'd')}
      </div>
      {filteredEvents.length > 0 && (
        <EventsList 
          events={filteredEvents} 
          date={date} 
          onEventClick={(event) => onEventClick(event, date)} 
        />
      )}
    </div>
  );
}
