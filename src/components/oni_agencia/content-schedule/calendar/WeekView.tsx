
import { format, addDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent } from "@/types/oni-agencia";
import { DraggableEventItem } from "../DraggableEventItem";
import { useState } from "react";
import { DndContext, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useCurrentUser } from "../hooks/useCurrentUser";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeekViewProps {
  events: CalendarEvent[];
  selectedDate: Date | undefined;
  currentDate: Date;
  selectedCollaborator?: string | null;
  weekDays: string[];
  onSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
}

export function WeekView({
  events,
  selectedDate,
  currentDate,
  selectedCollaborator,
  weekDays,
  onSelect,
  onEventClick
}: WeekViewProps) {
  const userName = useCurrentUser();
  const { isDragging, handleDragStart, handleDragEnd } = useDragAndDrop();
  
  // Get the first day of the week (Sunday) for the current month
  const weekStart = startOfWeek(currentDate);
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min drag distance before activation
      },
    })
  );

  // Generate the 7 days of the week
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="week-view-container">
        {weekDates.map((date, index) => {
          const dateStr = format(date, 'yyyy-MM-dd');
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
              key={dateStr}
              className={`week-view-day ${
                selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr ? 'bg-blue-50' : ''
              }`}
              onClick={() => onSelect(date)}
            >
              <div className="flex flex-col items-center mb-2 pb-1 border-b">
                <div className="text-sm font-medium">{weekDays[index]}</div>
                <div className={`text-xl font-bold ${
                  new Date().toDateString() === date.toDateString() ? 'text-primary' : ''
                }`}>{format(date, 'd')}</div>
              </div>
              
              {filteredEvents.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {filteredEvents.map((event) => (
                    <TooltipProvider key={event.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="event-item-wrapper">
                            <DraggableEventItem 
                              event={event}
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(event, date);
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
                <div className="text-center text-gray-400 text-sm mt-4">
                  Sem agendamentos
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DndContext>
  );
}
