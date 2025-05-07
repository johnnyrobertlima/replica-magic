
import React, { useMemo } from "react";
import { format, isSameMonth, isToday } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { CalendarEvent } from "@/types/oni-agencia";
import { EventsList } from "./EventsList";
import { cn } from "@/lib/utils";
import { useDroppable } from '@dnd-kit/core';

interface CalendarDayProps {
  date: Date;
  events: CalendarEvent[];
  selectedDate?: Date;
  selectedCollaborator?: string | null;
  onSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent, date: Date) => void;
}

export function CalendarDay({
  date,
  events,
  selectedDate,
  selectedCollaborator,
  onSelect,
  onEventClick
}: CalendarDayProps) {
  // Format date as ISO string for comparison
  const dateString = date.toISOString().split('T')[0];
  
  // Set up droppable area for this date
  const { setNodeRef, isOver } = useDroppable({
    id: dateString,
    data: {
      date: dateString,
      type: 'date'
    }
  });
  
  // Filter events for this date
  const dayEvents = useMemo(() => {
    // First filter by date
    const dateEvents = events.filter(
      (event) => event.scheduled_date === dateString
    );
    
    // Then filter by collaborator if one is selected
    if (selectedCollaborator) {
      return dateEvents.filter(event => {
        const isCollaborator = event.collaborator_id === selectedCollaborator;
        const isCreator = event.creators?.includes(selectedCollaborator) || false;
        return isCollaborator || isCreator;
      });
    }
    
    return dateEvents;
  }, [events, dateString, selectedCollaborator]);
  
  // Handle click on the day
  const handleClick = () => {
    if (onSelect) {
      onSelect(date);
    }
  };

  // Handle click on an event
  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event, date);
    }
  };

  // Day styles
  const isCurrentMonth = isSameMonth(date, new Date(date.getFullYear(), date.getMonth(), 1));
  const isSelectedDate = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  const isDifferentMonth = !isCurrentMonth;
  
  const dayClasses = cn(
    "calendar-day",
    {
      "bg-gray-50": isDifferentMonth,
      "selected": isSelectedDate,
      "drop-active": isOver
    }
  );

  const dayNumberClasses = cn(
    "calendar-day-number",
    {
      "today": isToday(date),
      "selected-day": isSelectedDate,
      "text-gray-400": isDifferentMonth
    }
  );

  return (
    <div
      ref={setNodeRef}
      className={dayClasses}
      onClick={handleClick}
      data-date={dateString}
    >
      <div className="calendar-day-header">
        <span className={dayNumberClasses}>
          {format(date, 'd')}
        </span>
      </div>
      <div className="calendar-day-content">
        {dayEvents.length > 0 ? (
          <EventsList
            events={dayEvents}
            date={date}
            onEventClick={(e, event) => handleEventClick(e, event)}
            isDraggable={true}
          />
        ) : (
          <div className="h-full">
            {isOver && (
              <div className="text-center p-2 text-blue-500 text-xs">
                Soltar aqui
              </div>  
            )}
          </div>
        )}
      </div>
    </div>
  );
}
