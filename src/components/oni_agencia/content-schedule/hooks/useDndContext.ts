
import { useState } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { CalendarEvent } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateContentSchedule } from "@/services/oniAgenciaContentScheduleServices";
import { format } from "date-fns";

interface UseDndContextProps {
  clientId: string;
  month: number;
  year: number;
  onManualRefetch?: () => void;
  forceImmediateRefresh?: () => Promise<any>;
}

export function useDndContext({ 
  clientId, 
  month, 
  year, 
  onManualRefetch,
  forceImmediateRefresh
}: UseDndContextProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutation for updating event date (drag-and-drop)
  const updateEventMutation = useMutation({
    mutationFn: updateContentSchedule,
    onSuccess: async (data, variables) => {
      console.log('Evento atualizado com sucesso:', data);
      toast({
        title: 'Evento atualizado',
        description: `Data do evento alterada para ${format(new Date(data.scheduled_date), 'dd/MM/yyyy')}`,
      });
      
      // Force immediate refresh after successful drag-and-drop
      if (forceImmediateRefresh) {
        console.log("Forçando refresh imediato após drag-and-drop bem sucedido");
        await forceImmediateRefresh();
      } else if (onManualRefetch) {
        console.log("Usando manual refetch após drag-and-drop");
        onManualRefetch();
      }
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar evento:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na operação',
        description: 'Não foi possível atualizar a data do evento.',
      });
    }
  });
  
  function handleEventClick(event: CalendarEvent, date: Date) {
    console.log(`Evento clicado: ${event.id} em ${date}`);
    setSelectedEvent(event);
    setSelectedDate(date);
    setIsDialogOpen(true);
  }
  
  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    console.log(`Data selecionada: ${date}`);
    
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setIsDialogOpen(true);
  }
  
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!active || !over) return;
    
    const eventId = active.id as string;
    const eventData = active.data?.current?.event as CalendarEvent;
    const newDate = over.id as string;
    
    // Check if we have valid data and a date change occurred
    if (eventData && eventId && newDate && eventData.scheduled_date !== newDate) {
      console.log(`Movendo evento ${eventId} para ${newDate}`);
      
      // Update the event date
      updateEventMutation.mutate({
        id: eventId,
        scheduled_date: newDate
      });
    } else {
      console.log('Drag cancelado - sem alteração de data ou dados incompletos');
    }
  }
  
  function handleDialogOpenChange(open: boolean) {
    setIsDialogOpen(open);
    if (!open) {
      // When dialog closes, clear the selection
      setSelectedEvent(undefined);
    }
  }
  
  function handleDialogClose() {
    setSelectedDate(undefined);
    setSelectedEvent(undefined);
    setIsDialogOpen(false);
  }

  return {
    selectedDate,
    selectedEvent,
    isDialogOpen,
    handleEventClick,
    handleDateSelect,
    handleDragEnd,
    handleDialogOpenChange,
    handleDialogClose,
  };
}
