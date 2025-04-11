
import { useState, useCallback } from "react";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { CalendarEvent } from "@/types/oni-agencia";
import { useUpdateContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { useToast } from "@/hooks/use-toast";

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
        
        // Only send the required fields for the update - primarily just the scheduled_date
        updateMutation.mutate(
          {
            id: draggedEvent.id,
            schedule: {
              scheduled_date: newDate,
              // Include only the client_id for proper cache invalidation
              client_id: draggedEvent.client_id
            }
          },
          {
            onSuccess: () => {
              toast({
                title: "Agendamento movido",
                description: `O agendamento foi movido para ${newDate}.`
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
  }, [draggedEvent, updateMutation, toast]);
  
  return {
    isDragging,
    handleDragStart,
    handleDragEnd
  };
}
