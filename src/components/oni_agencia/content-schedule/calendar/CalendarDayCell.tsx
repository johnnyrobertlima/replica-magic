
import { format } from "date-fns";
import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventsList } from "./EventsList";
import { MoreEventsIndicator } from "./MoreEventsIndicator";
import { ScrollableEvents } from "./ScrollableEvents";

interface CalendarDayCellProps {
  date: Date;
  events: CalendarEvent[];
  isSelected: boolean;
  isCurrentDay?: boolean;
  onSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
  selectedCollaborator?: string | null;
}

export function CalendarDayCell({ 
  date, 
  events, 
  isSelected, 
  isCurrentDay = false,
  onSelect, 
  onEventClick,
  selectedCollaborator
}: CalendarDayCellProps) {
  const [isHovering, setIsHovering] = useState(false);
  const dateString = format(date, 'yyyy-MM-dd');
  
  const { setNodeRef, isOver } = useDroppable({
    id: dateString,
  });
  
  let dayEvents = events.filter(event => event.scheduled_date === dateString);
  
  if (selectedCollaborator) {
    dayEvents = dayEvents.filter(event => {
      const isCollaborator = event.collaborator_id === selectedCollaborator;
      const isCreator = event.creators?.includes(selectedCollaborator) || false;
      return isCollaborator || isCreator;
    });
  }
  
  // Constants for visible events display
  const MAX_VISIBLE_EVENTS = 3;
  const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenEventsCount = Math.max(0, dayEvents.length - MAX_VISIBLE_EVENTS);
  
  const handleCellClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isEventClick = 
      target.closest('.event-item') || 
      target.classList.contains('event-item') ||
      target.closest('.event-item-wrapper') ||
      target.classList.contains('event-item-wrapper') ||
      target.closest('.events-overflow-indicator') ||
      target.classList.contains('events-overflow-indicator');
    
    if (!isEventClick) {
      console.log("Cell background clicked for date:", format(date, 'yyyy-MM-dd'));
      onSelect(date);
    }
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    console.log("Event clicked:", event.id, event.title);
    onEventClick(event, date);
  };
  
  // Mouse enter/leave events for scroll behavior
  const handleMouseEnter = () => {
    setIsHovering(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovering(false);
  };
  
  return (
    <div 
      ref={setNodeRef}
      className={`h-36 w-full border-r border-b cursor-pointer hover:bg-gray-50 calendar-day-cell p-1 relative ${
        isCurrentDay ? 'bg-blue-50' : ''
      } ${isOver ? 'bg-blue-100' : ''}`}
      onClick={handleCellClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex justify-between items-center mb-1">
        <button 
          className={`h-5 w-5 p-0 text-xs font-normal flex items-center justify-center rounded-full ${
            isSelected ? 'bg-primary text-primary-foreground' : ''
          }`}
        >
          {format(date, 'd')}
        </button>
      </div>
      
      {dayEvents.length > 0 ? (
        <>
          {!isHovering ? (
            <div className="flex flex-col gap-[2px]">
              <EventsList 
                events={visibleEvents} 
                onEventClick={handleEventClick} 
              />
              
              {hiddenEventsCount > 0 && (
                <div className="mt-1">
                  <MoreEventsIndicator 
                    count={hiddenEventsCount}
                    date={date}
                    events={dayEvents.slice(MAX_VISIBLE_EVENTS)}
                    onEventClick={handleEventClick}
                  />
                </div>
              )}
            </div>
          ) : (
            /* When hovering, show ScrollArea with all events */
            <ScrollableEvents 
              events={dayEvents} 
              onEventClick={handleEventClick} 
            />
          )}
        </>
      ) : (
        <div className="h-[calc(100%-20px)] w-full empty-cell-area" />
      )}
    </div>
  );
}
