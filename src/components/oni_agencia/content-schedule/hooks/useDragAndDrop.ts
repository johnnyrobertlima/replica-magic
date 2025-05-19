
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/oni-agencia";
import { format } from "date-fns";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { formatDateToString } from "./utils/dateUtils";
import { updateContentSchedulesCache, invalidateScheduleQueries } from "./utils/cacheUtils";
import { prepareEventUpdateData, updateEventScheduledDate } from "./utils/eventUpdateUtils";

export function useDragAndDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [activeDragEvent, setActiveDragEvent] = useState<CalendarEvent | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    console.log("Drag start event triggered:", event);
    
    try {
      // Extract the CalendarEvent from the draggable item's data, with proper null checks
      const calendarEvent = event.active?.data?.current?.event;
      
      if (calendarEvent && calendarEvent.id) {
        console.log("Starting drag for event:", calendarEvent.id, calendarEvent.title);
        setIsDragging(true);
        setActiveDragEvent(calendarEvent);
        
        // Visual feedback
        document.body.style.cursor = 'grabbing';
        
        // Notify user that drag is active
        toast({
          title: "Arrasto iniciado",
          description: "Arraste para uma data para mover o agendamento.",
          duration: 3000,
        });
      } else {
        console.error("Drag started but no valid event data found:", event.active?.data?.current);
      }
    } catch (error) {
      console.error("Error in handleDragStart:", error);
    }
  }, [toast]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    console.log("Drag end event called with:", event);
    
    // Reset cursor
    document.body.style.cursor = '';
    
    if (!activeDragEvent) {
      console.log("No active drag event to handle");
      setIsDragging(false);
      return;
    }
    
    try {
      if (event.over && event.over.data) {
        console.log("Drop target found:", event.over.id);
        console.log("Drop target data:", event.over.data.current);
        
        // Get the date from the droppable area's data
        const dropDate = event.over.data.current?.date;
        
        if (dropDate instanceof Date) {
          console.log("Handling drop to date:", format(dropDate, 'yyyy-MM-dd'));
          handleDrop(dropDate);
        } else {
          console.error("Drop area has no valid date data:", event.over.data.current);
          toast({
            variant: "destructive",
            title: "Erro ao mover agendamento",
            description: "Área de destino inválida.",
          });
        }
      } else {
        console.log("No valid drop target found");
        toast({
          title: "Movimento cancelado",
          description: "Arraste para uma data válida para mover o agendamento.",
        });
      }
    } catch (error) {
      console.error("Error in handleDragEnd:", error);
      toast({
        variant: "destructive",
        title: "Erro ao processar arrasto",
        description: "Ocorreu um erro ao finalizar o arrasto.",
      });
    } finally {
      setIsDragging(false);
      setActiveDragEvent(null);
    }
  }, [activeDragEvent, toast]);

  const handleDrop = async (date: Date) => {
    if (!activeDragEvent) {
      console.error("Nenhum evento ativo para arrastar");
      return;
    }
    
    if (!activeDragEvent.id) {
      console.error("Evento sem ID não pode ser arrastado:", activeDragEvent);
      toast({
        variant: "destructive",
        title: "Erro ao mover agendamento",
        description: "O evento não possui um ID válido.",
      });
      return;
    }
    
    try {
      const formattedDate = formatDateToString(date);
      console.log(`Attempting to move event from ${activeDragEvent.scheduled_date} to ${formattedDate}`);
      
      if (formattedDate === activeDragEvent.scheduled_date) {
        console.log("Source and destination dates are the same, cancelling move");
        return;
      }
      
      console.log(`Moving event ${activeDragEvent.id} from ${activeDragEvent.scheduled_date} to ${formattedDate}`);
      
      // Prepare data for update
      const { apiData } = prepareEventUpdateData(activeDragEvent, date);
      
      // Backup of the original event for use in case of error
      const originalEvent = { ...activeDragEvent };
      
      // Update the event in local state immediately for optimistic update
      const updatedEvent = {
        ...activeDragEvent,
        scheduled_date: formattedDate
      };
      
      // Update all queries to reflect the change optimistically
      updateContentSchedulesCache(queryClient, originalEvent, updatedEvent);
      
      // Show "updating" toast
      toast({
        title: "Movendo agendamento...",
        description: "Aguarde enquanto atualizamos o agendamento.",
      });
      
      // Make the update API call
      await updateEventScheduledDate(activeDragEvent.id, apiData);
      
      // Show success toast
      toast({
        title: "Agendamento movido",
        description: "O agendamento foi movido para outra data com sucesso.",
      });
      
      // Force a refetch to ensure data consistency
      invalidateScheduleQueries(queryClient);
    } catch (error) {
      console.error("Error moving event:", error);
      toast({
        variant: "destructive",
        title: "Erro ao mover agendamento",
        description: "Não foi possível mover o agendamento para a nova data.",
      });
      
      // If there's an error, refetch to restore the correct data
      invalidateScheduleQueries(queryClient);
    }
  };

  return {
    isDragging,
    activeDragEvent,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  };
}
