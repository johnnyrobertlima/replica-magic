
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventsList } from "./EventsList";
import { useDroppable } from "@dnd-kit/core";
import React, { useCallback, useMemo } from "react";

interface CalendarDayProps {
  date: Date;
  selectedDate?: Date;
  events: CalendarEvent[];
  selectedCollaborator?: string | null;
  onSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
}

export function CalendarDay({
  date,
  selectedDate,
  events,
  selectedCollaborator,
  onSelect,
  onEventClick
}: CalendarDayProps) {
  // Set up the droppable area for this day with a stable ID
  const dropId = `day-${format(date, 'yyyy-MM-dd')}`;
  
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: { date }
  });
  
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Melhoria de performance utilizando useCallback para funções de evento
  const handleDayClick = useCallback(() => {
    onSelect(date);
  }, [date, onSelect]);
  
  // Create an event click handler that adapts the parameters
  const handleEventClick = useCallback((e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    onEventClick(event, date);
  }, [date, onEventClick]);
  
  // FIXED: Filtra eventos para esse dia específico usando useMemo para otimização
  const filteredEvents = useMemo(() => {
    // First filter events for this specific day
    const dayEvents = events.filter(event => event.scheduled_date === dateStr);
    
    // Then apply collaborator filter if needed
    if (!selectedCollaborator) return dayEvents;
    
    return dayEvents.filter(event => {
      // Check if person is main collaborator
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      
      // Check if person is in creators array
      let isCreator = false;
      if (event.creators) {
        // Ensure creators is always treated as an array
        const creatorsArray = Array.isArray(event.creators) ? event.creators : 
                            (typeof event.creators === 'string' ? [event.creators] : []);
        
        isCreator = creatorsArray.includes(selectedCollaborator);
      }
      
      return isCollaborator || isCreator;
    });
  }, [events, dateStr, selectedCollaborator]);
  
  const isActive = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr;
  
  return (
    <div 
      ref={setNodeRef}
      className={`calendar-day relative p-1 min-h-[80px] border border-gray-100 ${
        isActive ? 'bg-blue-50' : isOver ? 'bg-blue-50' : 'bg-white'
      }`} 
      onClick={handleDayClick}
    >
      {/* Show day number in the top-left corner */}
      <div className="text-xs text-gray-500 mb-1">{date.getDate()}</div>
      
      {/* Render events for this day */}
      {filteredEvents.length > 0 && (
        <EventsList 
          events={filteredEvents}
          date={date}
          onEventClick={handleEventClick}
        />
      )}
    </div>
  );
}
