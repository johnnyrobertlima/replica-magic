
import { useState, useCallback } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { useUpdateContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { useToast } from "@/hooks/use-toast";

interface UseDndContextProps {
  clientId: string;
  month: number;
  year: number;
  onManualRefetch?: () => void; // Adicionamos essa prop
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
    
    if (!over || !active) return;

    const eventId = active.id;
    const scheduleEvent = active.data.current as CalendarEvent;
    const targetDateObj = over.data.current?.date as Date;
    
    if (!scheduleEvent || !targetDateObj) {
      console.log("Missing data for drag operation", { eventId, scheduleEvent, targetDateObj });
      return;
    }
    
    const oldDate = scheduleEvent.scheduled_date;
    const newDate = format(targetDateObj, 'yyyy-MM-dd');
    
    if (oldDate === newDate) {
      // No change in date, no need to update
      return;
    }
    
    try {
      console.log(`Moving event ${eventId} from ${oldDate} to ${newDate}`);
      
      await updateMutation.mutateAsync({
        id: scheduleEvent.id,
        data: {
          ...scheduleEvent,
          scheduled_date: newDate
        }
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
