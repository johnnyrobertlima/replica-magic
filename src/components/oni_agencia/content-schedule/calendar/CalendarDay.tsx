
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventsList } from "./EventsList";
import { useDroppable } from "@dnd-kit/core";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import React from "react";

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
  // Get the handleDrop function from our custom hook
  const { handleDrop } = useDragAndDrop();
  
  // Set up the droppable area for this day
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${format(date, 'yyyy-MM-dd')}`,
    data: { date }
  });
  
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayEvents = events.filter(event => event.scheduled_date === dateStr);
  
  const filteredEvents = selectedCollaborator 
    ? dayEvents.filter(event => {
        const isCollaborator = event.collaborator_id === selectedCollaborator;
        const isCreator = event.creators?.includes(selectedCollaborator) || false;
        return isCollaborator || isCreator;
      })
    : dayEvents;
  
  const handleDayClick = () => {
    onSelect(date);
  };
  
  // Create an event click handler that adapts the parameters
  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    onEventClick(event, date);
  };
  
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
