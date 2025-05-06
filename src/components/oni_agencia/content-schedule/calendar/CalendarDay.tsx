
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventsList } from "./EventsList";
import { useDroppable } from "@dnd-kit/core";
import React, { useCallback } from "react";

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
  
  // Filtra eventos para esse dia e aplicando o filtro de colaborador se necessário
  const dayEvents = events.filter(event => event.scheduled_date === dateStr);
  const filteredEvents = selectedCollaborator 
    ? dayEvents.filter(event => {
        const isCollaborator = event.collaborator_id === selectedCollaborator;
        const isCreator = event.creators?.includes(selectedCollaborator) || false;
        return isCollaborator || isCreator;
      })
    : dayEvents;
  
  return (
    <div 
      ref={setNodeRef}
      className={`calendar-day ${isOver ? 'bg-blue-50' : ''}`} 
      onClick={handleDayClick}
    >
      <EventsList 
        events={filteredEvents} 
        date={date} 
        onEventClick={handleEventClick}
      />
    </div>
  );
}
