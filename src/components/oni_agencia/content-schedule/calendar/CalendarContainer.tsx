
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDay } from "./CalendarDay";
import { CalendarEvent } from "@/types/oni-agencia";
import { ptBR } from "date-fns/locale";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useState, useEffect } from "react";

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
  
  // Get username first - maintain hook order
  const userName = useCurrentUser();
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min drag distance before activation
      },
    })
  );
  
  // Add a more reliable refresh mechanism
  useEffect(() => {
    // When events array changes, increment refresh key
    setRefreshKey(prev => prev + 1);
  }, [events]);
  
  // Handler para garantir que a UI seja atualizada após drag-and-drop
  const handleDragComplete = (success: boolean, eventId?: string) => {
    if (success) {
      console.log(`Drag bem sucedido para evento ${eventId}, forçando remontagem do calendário`);
      
      // Incrementar o refresh key para força a remontagem completa
      setRefreshKey(prev => prev + 1);
      
      // Esperar um tempo curto e forçar mais uma atualização
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 100);
      
      // Chamar o callback externo
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
          key={`calendar-${refreshKey}-${events.length}`}
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
                events={events}
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
