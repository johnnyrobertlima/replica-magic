
import { format, isSameDay } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "./EventItem";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  
  // Filter events by date and collaborator if selected
  let dayEvents = events.filter(event => event.scheduled_date === dateString);
  
  if (selectedCollaborator) {
    dayEvents = dayEvents.filter(event => event.collaborator_id === selectedCollaborator);
  }
  
  // Maximum number of events to display before showing "+X more"
  const MAX_VISIBLE_EVENTS = 4;
  const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenEventsCount = dayEvents.length - MAX_VISIBLE_EVENTS;
  
  // Handle click on the empty space of the cell to create a new event
  const handleCellClick = (e: React.MouseEvent) => {
    // Only trigger if clicking directly on the cell, not on an event
    if ((e.target as HTMLElement).closest('.event-item') === null) {
      onSelect(date);
    }
  };
  
  return (
    <div 
      className={`h-36 w-full border-r border-b cursor-pointer hover:bg-gray-50 calendar-day-cell p-1 relative ${
        isCurrentDay ? 'bg-blue-50' : ''
      }`}
      onClick={handleCellClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
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
        <div className="flex flex-col gap-0 overflow-y-auto max-h-[120px]">
          {visibleEvents.map((event) => (
            <TooltipProvider key={event.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="event-item mb-[1px]">
                    <EventItem 
                      event={event}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event, date);
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[300px]">
                  <div className="text-xs space-y-1">
                    <p className="font-bold">{event.title}</p>
                    <p><strong>Serviço:</strong> {event.service.name}</p>
                    {event.product && <p><strong>Produto:</strong> {event.product.name}</p>}
                    {event.collaborator && <p><strong>Responsável:</strong> {event.collaborator.name}</p>}
                    {event.status && <p><strong>Status:</strong> {event.status.name}</p>}
                    {event.description && <p><strong>Descrição:</strong> {event.description}</p>}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {hiddenEventsCount > 0 && (
            <div 
              className="text-xs text-primary font-medium px-1 py-0.5 cursor-pointer hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(date);
              }}
            >
              + {hiddenEventsCount} mais agendamento{hiddenEventsCount > 1 ? 's' : ''}...
            </div>
          )}
        </div>
      ) : (
        // Empty state to make sure the entire cell is clickable for creating new events
        <div className="h-[calc(100%-20px)] w-full" />
      )}
    </div>
  );
}
