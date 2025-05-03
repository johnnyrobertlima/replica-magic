
import { format, isSameDay } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventItem } from "../EventItem";
import { DraggableEventItem } from "../DraggableEventItem";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDroppable } from "@dnd-kit/core";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [isExpanded, setIsExpanded] = useState(false);
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
  
  const MAX_VISIBLE_EVENTS = 4;
  const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, MAX_VISIBLE_EVENTS);
  const hiddenEventsCount = dayEvents.length - MAX_VISIBLE_EVENTS;
  
  const handleCellClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isEventClick = 
      target.closest('.event-item') || 
      target.classList.contains('event-item') ||
      target.closest('.event-item-wrapper') ||
      target.classList.contains('event-item-wrapper');
    
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

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div 
      ref={setNodeRef}
      className={`h-36 w-full border-r border-b cursor-pointer hover:bg-gray-50 calendar-day-cell p-1 relative ${
        isCurrentDay ? 'bg-blue-50' : ''
      } ${isOver ? 'bg-blue-100' : ''}`}
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
        <div className="flex flex-col gap-[2px] overflow-y-auto max-h-[120px]">
          {visibleEvents.map((event) => (
            <TooltipProvider key={event.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="event-item-wrapper">
                    <DraggableEventItem 
                      event={event}
                      onClick={(e) => handleEventClick(e, event)}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[300px] bg-white border shadow-md">
                  <div className="text-xs space-y-1">
                    <p className="font-bold">{event.title}</p>
                    {event.client && <p><strong>Cliente:</strong> {event.client.name}</p>}
                    <p><strong>Serviço:</strong> {event.service?.name}</p>
                    {event.product && <p><strong>Produto:</strong> {event.product.name}</p>}
                    {event.collaborator && <p><strong>Responsável:</strong> {event.collaborator.name}</p>}
                    {event.status && <p><strong>Status:</strong> {event.status.name}</p>}
                    {event.editorial_line && <p><strong>Linha Editorial:</strong> {event.editorial_line.name}</p>}
                    {event.execution_phase && <p><strong>Fase de Execução:</strong> {event.execution_phase}</p>}
                    {event.description && (
                      <div>
                        <strong>Descrição:</strong>
                        <p className="mt-1 text-gray-600 italic max-h-[100px] overflow-y-auto">
                          {event.description}
                        </p>
                      </div>
                    )}
                    <p><strong>Data:</strong> {format(new Date(event.scheduled_date), 'dd/MM/yyyy')}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {!isExpanded && hiddenEventsCount > 0 && (
            <button
              className="text-xs text-primary font-medium px-1 py-0.5 hover:bg-gray-100 rounded flex items-center justify-between"
              onClick={handleExpandClick}
            >
              <span>+ {hiddenEventsCount} mais agendamento{hiddenEventsCount > 1 ? 's' : ''}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
          )}
          
          {isExpanded && hiddenEventsCount > 0 && (
            <button
              className="text-xs text-primary font-medium px-1 py-0.5 hover:bg-gray-100 rounded flex items-center justify-between"
              onClick={handleExpandClick}
            >
              <span>Mostrar menos</span>
              <ChevronUp className="h-3 w-3" />
            </button>
          )}
        </div>
      ) : (
        <div className="h-[calc(100%-20px)] w-full empty-cell-area" />
      )}
    </div>
  );
}
