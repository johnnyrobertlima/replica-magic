
import { useState, useCallback } from "react";
import { DndContext, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { useUpdateContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { useToast } from "@/hooks/use-toast";

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

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // Reset state when dialog is closed
      setSelectedEvent(undefined);
      setSelectedDate(undefined);
    }
  }, []);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedEvent(undefined);
    setSelectedDate(undefined);
  }, []);

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
      
      // Create a clean update object with only the fields we want to update
      const updateData = {
        client_id: draggedEvent.client_id,
        service_id: draggedEvent.service_id,
        collaborator_id: draggedEvent.collaborator_id,
        title: draggedEvent.title,
        description: draggedEvent.description,
        scheduled_date: newDate,
        execution_phase: draggedEvent.execution_phase,
        editorial_line_id: draggedEvent.editorial_line_id,
        product_id: draggedEvent.product_id,
        status_id: draggedEvent.status_id,
        creators: draggedEvent.creators,
        capture_date: draggedEvent.capture_date,
        capture_end_date: draggedEvent.capture_end_date,
        is_all_day: draggedEvent.is_all_day,
        location: draggedEvent.location
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
      
      // Use the provided manual refetch function to update data
      if (onManualRefetch) {
        setTimeout(() => {
          console.log("Executando atualização manual após drag and drop");
          onManualRefetch();
        }, 300);
      }
    } catch (error) {
      console.error("Failed to update event date:", error);
      toast({
        variant: "destructive",
        title: "Erro ao mover evento",
        description: "Não foi possível alterar a data do evento."
      });
    }
  }, [updateMutation, toast, onManualRefetch]);

  const dndContext = {
    DndContext
  };

  return {
    selectedDate,
    selectedEvent,
    isDialogOpen,
    dndContext,
    handleDateSelect,
    handleEventClick,
    handleDragEnd,
    handleDialogOpenChange,
    handleDialogClose
  };
}
