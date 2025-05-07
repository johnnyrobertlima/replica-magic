
import { useState, useCallback } from "react";
import { DndContext as DndContextComponent, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { useUpdateContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface UseDndContextProps {
  clientId: string;
  month: number;
  year: number;
  onManualRefetch?: () => void;
}

export function useDndContext({ clientId, month, year, onManualRefetch }: UseDndContextProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updateMutation = useUpdateContentSchedule();

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setIsDialogOpen(true);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent, date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(event);
    setIsDialogOpen(true);
  }, []);

  const forceDataRefresh = useCallback(() => {
    if (!onManualRefetch) return;
    
    console.log("Executando atualização forçada de dados com múltiplas chamadas");
    
    // Primeiro invalidamos o cache
    queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
    queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    
    // Depois executamos a atualização manual múltiplas vezes
    onManualRefetch();
    
    // Chamadas adicionais com delay crescente
    setTimeout(() => {
      console.log("Atualização forçada: chamada 2 (100ms)");
      onManualRefetch();
    }, 100);
    
    setTimeout(() => {
      console.log("Atualização forçada: chamada 3 (300ms)");
      onManualRefetch();
    }, 300);
    
    // Uma última chamada para garantir
    setTimeout(() => {
      console.log("Atualização forçada: chamada 4 (700ms)");
      onManualRefetch();
    }, 700);
  }, [onManualRefetch, queryClient]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      setSelectedEvent(undefined);
      setSelectedDate(undefined);
      
      // Trigger data refresh when dialog closes
      forceDataRefresh();
    }
  }, [forceDataRefresh]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedEvent(undefined);
    setSelectedDate(undefined);
    
    // Trigger data refresh when dialog is manually closed
    forceDataRefresh();
  }, [forceDataRefresh]);

  // Function to handle drag and drop of events
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) {
      console.log("No valid over or active data for drag operation");
      return;
    }

    // Extract event ID directly from active.id
    const eventId = active.id as string;
    
    // Get the event data and target date
    const draggedEvent = active.data.current?.event as CalendarEvent;
    const targetDateObj = over.data.current?.date as Date;
    
    if (!draggedEvent || !targetDateObj) {
      console.log("Missing data for drag operation", { eventId, draggedEvent, targetDateObj });
      return;
    }
    
    // Validate that we have a proper event ID
    if (!eventId || eventId === 'undefined') {
      console.error("Invalid event ID for drag operation:", eventId);
      toast({
        variant: "destructive",
        title: "Erro ao mover evento",
        description: "ID do evento inválido."
      });
      return;
    }
    
    const oldDate = draggedEvent.scheduled_date;
    const newDate = format(targetDateObj, 'yyyy-MM-dd');
    
    if (oldDate === newDate) {
      // No change in date, no need to update
      console.log("No date change detected, skipping update");
      return;
    }
    
    try {
      console.log(`Moving event ${eventId} from ${oldDate} to ${newDate}`);
      
      // Create a complete update object with all required fields from the current event
      const updateData = {
        client_id: draggedEvent.client_id,
        service_id: draggedEvent.service_id,
        title: draggedEvent.title || " ",
        description: draggedEvent.description,
        collaborator_id: draggedEvent.collaborator_id,
        scheduled_date: newDate,
        execution_phase: draggedEvent.execution_phase,
        editorial_line_id: draggedEvent.editorial_line_id,
        product_id: draggedEvent.product_id,
        status_id: draggedEvent.status_id,
        creators: draggedEvent.creators
      };
      
      // Update the database with the new date
      await updateMutation.mutateAsync({
        id: eventId,
        data: updateData
      });
      
      toast({
        title: "Evento movido",
        description: `Evento movido para ${format(targetDateObj, 'dd/MM/yyyy')}`
      });
      
      // Apply optimistic update to UI immediately
      const contentSchedulesKey = ['content-schedules'];
      const infiniteContentSchedulesKey = ['infinite-content-schedules'];
      
      // Get current data, update it, and set it back
      const currentData = queryClient.getQueryData(contentSchedulesKey) as CalendarEvent[] | undefined;
      if (currentData) {
        const updatedData = currentData.map(event => {
          if (event.id === eventId) {
            return { ...event, scheduled_date: newDate };
          }
          return event;
        });
        queryClient.setQueryData(contentSchedulesKey, updatedData);
      }
      
      // Update infinite queries too
      const infiniteData = queryClient.getQueryData(infiniteContentSchedulesKey) as any;
      if (infiniteData?.pages) {
        const updatedInfiniteData = {
          ...infiniteData,
          pages: infiniteData.pages.map((page: any) => {
            if (page.data) {
              return {
                ...page,
                data: page.data.map((event: CalendarEvent) => {
                  if (event.id === eventId) {
                    return { ...event, scheduled_date: newDate };
                  }
                  return event;
                })
              };
            }
            return page;
          })
        };
        queryClient.setQueryData(infiniteContentSchedulesKey, updatedInfiniteData);
      }
      
      // Forçar atualização dos dados após drag-and-drop usando nossa função aprimorada
      console.log("Executando atualização manual após drag and drop");
      forceDataRefresh();
      
    } catch (error) {
      console.error("Failed to update event date:", error);
      toast({
        variant: "destructive",
        title: "Erro ao mover evento",
        description: "Não foi possível alterar a data do evento."
      });
      
      // Force a refresh on error to maintain consistent state
      forceDataRefresh();
    }
  }, [updateMutation, toast, forceDataRefresh, queryClient]);

  return {
    selectedDate,
    selectedEvent,
    isDialogOpen,
    handleDateSelect,
    handleEventClick,
    handleDragEnd,
    handleDialogOpenChange,
    handleDialogClose
  };
}
