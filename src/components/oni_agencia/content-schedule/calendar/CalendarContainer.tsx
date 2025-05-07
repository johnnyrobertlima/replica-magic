
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDay } from "./CalendarDay";
import { CalendarEvent } from "@/types/oni-agencia";
import { ptBR } from "date-fns/locale";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface CalendarContainerProps {
  events: CalendarEvent[];
  selectedDate: Date | undefined;
  currentDate: Date;
  selectedCollaborator?: string | null;
  onSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
  onDragSuccess?: (success: boolean, eventId?: string) => void;
}

export function CalendarContainer({
  events,
  selectedDate,
  currentDate,
  selectedCollaborator,
  onSelect,
  onEventClick,
  onDragSuccess
}: CalendarContainerProps) {
  // Estado para forçar renderização após drag-and-drop
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>(events);
  
  // Get username first - maintain hook order
  const userName = useCurrentUser();
  const queryClient = useQueryClient();
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min drag distance before activation
      },
    })
  );
  
  // Update localEvents when events prop changes
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);
  
  // Direct refresh function - no throttling
  const refreshEvents = async () => {
    console.log("Forcing immediate events refresh without throttling");
    
    // Force invalidation of all relevant queries
    await queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
    await queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    
    // Get fresh data directly from the cache
    const freshData = queryClient.getQueryData<CalendarEvent[]>(['content-schedules']);
    if (freshData) {
      console.log(`RefetchEvents: Got ${freshData.length} events`);
      setLocalEvents(freshData);
      
      // Force component remount with key change
      setRefreshKey(prev => prev + 1);
    }
  };
  
  // Handler for immediate UI update after drag-and-drop
  const handleDragComplete = async (success: boolean, eventId?: string) => {
    if (success) {
      console.log(`Drag bem sucedido para evento ${eventId}, atualizando calendário`);
      
      // Step 1: Immediate refresh of data
      await refreshEvents();
      
      // Step 2: Force UI update by remounting calendar
      setRefreshKey(prev => prev + 1);
      
      // Step 3: Call external callback
      if (onDragSuccess) {
        onDragSuccess(success, eventId);
      }
    }
  };
  
  // Get drag-and-drop handlers with custom callback
  const { isDragging, handleDragStart, handleDragEnd } = useDragAndDrop(handleDragComplete);

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full p-0">
        <Calendar
          key={`calendar-${refreshKey}-${localEvents.length}`}
          mode="single"
          selected={selectedDate}
          onSelect={onSelect}
          month={currentDate}
          className="w-full rounded-md border-none"
          locale={ptBR}
          components={{
            Day: ({ date, ...dayProps }) => (
              <CalendarDay
                date={date}
                selectedDate={selectedDate}
                events={localEvents}
                selectedCollaborator={selectedCollaborator}
                onSelect={onSelect}
                onEventClick={onEventClick}
              />
            ),
            Caption: () => null, // Hide the default caption since we have a custom header
          }}
        />
      </div>
    </DndContext>
  );
}
