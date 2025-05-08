
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/oni-agencia";
import { updateEventDate } from "@/services/oniAgenciaCalendarEventServices";

interface UseDndContextProps {
  onEventUpdate?: () => void;
}

export const useDndContext = ({ onEventUpdate }: UseDndContextProps = {}) => {
  const { toast } = useToast();
  const [activeDragEvent, setActiveDragEvent] = useState<CalendarEvent | null>(null);

  const handleDragStart = useCallback((event: any) => {
    setActiveDragEvent(event.active.data.current as CalendarEvent);
  }, []);

  const updateEventDate = async (eventId: string, newDate: Date): Promise<boolean> => {
    try {
      await updateEventDate(eventId, newDate);
      toast({
        title: "Data atualizada",
        description: "A data do evento foi atualizada com sucesso.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Erro ao atualizar data",
        description: "Ocorreu um erro ao atualizar a data do evento.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleDragEnd = useCallback(
    async (event: any) => {
      const { over } = event;

      if (over) {
        const date = over.data.current as Date;
        if (date && activeDragEvent) {
          try {
            const success = await updateEventDate(activeDragEvent.id, date);
            if (success && onEventUpdate) {
              onEventUpdate();
            }
          } catch (error) {
            console.error("Error updating event date:", error);
          }
        }
      }

      setActiveDragEvent(null);
    },
    [activeDragEvent, onEventUpdate]
  );

  const handleDrop = async (date: Date): Promise<void> => {
    // Only proceed if we have a drag event
    if (!activeDragEvent) return Promise.resolve();

    try {
      const success = await updateEventDate(activeDragEvent.id, date);
      if (success && onEventUpdate) {
        onEventUpdate();
      }
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating event date:", error);
      return Promise.reject(error);
    }
  };

  return {
    activeDragEvent,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  };
};
