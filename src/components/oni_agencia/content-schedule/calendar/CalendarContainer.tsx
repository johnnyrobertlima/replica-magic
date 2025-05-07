
import { DndContext, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDay } from "./CalendarDay";
import { CalendarEvent } from "@/types/oni-agencia";
import { ptBR } from "date-fns/locale";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";

interface CalendarContainerProps {
  events: CalendarEvent[];
  selectedDate: Date | undefined;
  currentDate: Date;
  selectedCollaborator?: string | null;
  onSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent, date: Date) => void;
  onManualRefetch?: () => void;
}

export function CalendarContainer({
  events,
  selectedDate,
  currentDate,
  selectedCollaborator,
  onSelect,
  onEventClick,
  onManualRefetch
}: CalendarContainerProps) {
  // Estado para forçar renderização após drag-and-drop
  const [dragCompleted, setDragCompleted] = useState(0);
  const lastRefetchTimeRef = useRef<number>(0);
  
  // Get queryClient for forceful updates
  const queryClient = useQueryClient();
  
  // Get username first - maintain hook order
  const userName = useCurrentUser();
  
  // Função para garantir que não ocorram múltiplas atualizações em curto período
  const executeRefetch = () => {
    const now = Date.now();
    if (now - lastRefetchTimeRef.current < 300) {
      console.log("Ignorando refetch muito próximo do anterior");
      return;
    }
    
    lastRefetchTimeRef.current = now;
    console.log("Executando atualização manual forçada do calendário");
    
    // Invalidar caches
    queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
    queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    
    // Executar refetch manual se disponível
    if (onManualRefetch) {
      onManualRefetch();
      
      // Executa múltiplas vezes com delays para garantir que os dados sejam atualizados
      setTimeout(() => onManualRefetch(), 100);
      setTimeout(() => onManualRefetch(), 300);
      setTimeout(() => onManualRefetch(), 600);
      setTimeout(() => onManualRefetch(), 1000);
    }
    
    // Força re-renderização do componente
    setDragCompleted(prev => prev + 1);
  };
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min drag distance before activation
      },
    })
  );
  
  // Get drag-and-drop handlers with custom refetch function
  const { isDragging, handleDragStart, handleDragEnd } = useDragAndDrop((success: boolean) => {
    if (success) {
      console.log("Atualizando calendário após drag-and-drop bem sucedido");
      executeRefetch();
    }
  });

  // Efeito para garantir a atualização após drag-and-drop
  useEffect(() => {
    if (dragCompleted > 0) {
      console.log(`Renderização forçada após drag-and-drop completado (${dragCompleted})`);
      if (onManualRefetch) {
        onManualRefetch();
      }
    }
  }, [dragCompleted, onManualRefetch]);

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full p-0">
        <Calendar
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
