
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent } from "@/types/oni-agencia";
import { DraggableEventItem } from "../DraggableEventItem";
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useCurrentUser } from "../hooks/useCurrentUser";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DayViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  currentDate: Date;
  selectedCollaborator?: string | null;
  onSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
}

export function DayView({
  events,
  selectedDate,
  currentDate,
  selectedCollaborator,
  onSelect,
  onEventClick
}: DayViewProps) {
  const userName = useCurrentUser();
  const { isDragging, handleDragStart, handleDragEnd } = useDragAndDrop(events, userName);
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min drag distance before activation
      },
    })
  );

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayEvents = events.filter(event => event.scheduled_date === dateStr);
  
  const filteredEvents = selectedCollaborator 
    ? dayEvents.filter(event => {
        const isCollaborator = event.collaborator_id === selectedCollaborator;
        const isCreator = event.creators?.includes(selectedCollaborator) || false;
        return isCollaborator || isCreator;
      })
    : dayEvents;

  // Create time slots for each hour
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="day-view-container">
        <h2 className="text-lg font-bold mb-4 text-center">
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </h2>
        
        {filteredEvents.length > 0 ? (
          <div className="flex flex-col gap-2 mb-6">
            <h3 className="text-md font-medium">Agendamentos do dia:</h3>
            {filteredEvents.map((event) => (
              <TooltipProvider key={event.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="event-item-wrapper">
                      <DraggableEventItem 
                        event={event}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event, selectedDate);
                        }}
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
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 text-sm my-8 p-4 border border-dashed rounded-md">
            Sem agendamentos para este dia. Clique em qualquer hora para adicionar um novo agendamento.
          </div>
        )}
        
        <div className="mt-4 border-t">
          <h3 className="text-md font-medium my-4">Horários:</h3>
          {hours.map((hour) => {
            const hourLabel = `${hour}:00`;
            return (
              <div key={hour} className="day-view-hour" onClick={() => onSelect(selectedDate)}>
                <div className="day-view-hour-label">{hourLabel}</div>
                <div className="day-view-hour-content"></div>
              </div>
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}
