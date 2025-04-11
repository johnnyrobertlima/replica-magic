
import { useState, useCallback } from "react";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { CalendarEvent } from "@/types/oni-agencia";
import { useUpdateContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useDragAndDrop(events: CalendarEvent[], userName: string) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  
  const updateMutation = useUpdateContentSchedule();
  const { toast } = useToast();
  
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const eventId = event.active.id as string;
    const draggedEvent = events.find(e => e.id === eventId);
    
    if (draggedEvent) {
      setDraggedEvent(draggedEvent);
      setIsDragging(true);
      console.log("Started dragging event:", eventId);
    }
  }, [events]);
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setIsDragging(false);
    
    if (!draggedEvent) return;
    
    const { active, over } = event;
    
    if (over) {
      const newDate = over.id as string; // The date string in format YYYY-MM-DD
      const oldDate = draggedEvent.scheduled_date;
      
      if (newDate !== oldDate) {
        console.log(`Moving event from ${oldDate} to ${newDate}`);
        
        // Format dates for the message
        const oldDateFormatted = format(new Date(oldDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        const newDateFormatted = format(new Date(newDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
        
        // Create movement record message
        const movementRecord = `[${new Date().toLocaleString()}] Movido de ${oldDateFormatted} para ${newDateFormatted} por ${userName}.`;
        
        // Append to existing description or create new
        const updatedDescription = draggedEvent.description 
          ? `${draggedEvent.description}\n\n${movementRecord}` 
          : movementRecord;
        
        // Create a minimal update object with only the necessary fields
        const updateData = {
          id: draggedEvent.id,
          schedule: {
            scheduled_date: newDate,
            description: updatedDescription,
            client_id: draggedEvent.client_id
          }
        };
        
        updateMutation.mutate(
          updateData,
          {
            onSuccess: () => {
              toast({
                title: "Agendamento movido",
                description: `O agendamento foi movido para ${newDateFormatted}.`
              });
            },
            onError: (error) => {
              toast({
                title: "Erro ao mover agendamento",
                description: "Ocorreu um erro ao mover o agendamento.",
                variant: "destructive",
              });
            }
          }
        );
      }
    }
    
    setDraggedEvent(null);
  }, [draggedEvent, updateMutation, toast, userName]);
  
  return {
    isDragging,
    handleDragStart,
    handleDragEnd
  };
}
