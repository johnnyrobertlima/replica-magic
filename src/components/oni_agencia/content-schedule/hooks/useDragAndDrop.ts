
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/oni-agencia";
import { updateContentSchedule } from "@/services/oniAgenciaContentScheduleServices";
import { format } from "date-fns";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

// Novo tipo para callback de atualização
type UpdateCallback = (success: boolean) => void;

export function useDragAndDrop(onUpdateCallback?: UpdateCallback) {
  const [isDragging, setIsDragging] = useState(false);
  const [activeDragEvent, setActiveDragEvent] = useState<CalendarEvent | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    // Extract the CalendarEvent from the draggable item's data
    const calendarEvent = event.active.data.current?.event as CalendarEvent;
    if (calendarEvent) {
      console.log("Iniciando arrasto do evento:", calendarEvent.id, calendarEvent.title);
      setIsDragging(true);
      setActiveDragEvent(calendarEvent);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    if (activeDragEvent && event.over) {
      // Get the date from the droppable area's data
      const dropDate = event.over.data.current?.date as Date;
      if (dropDate) {
        handleDrop(dropDate);
      }
    }
    
    setIsDragging(false);
    setActiveDragEvent(null);
  }, [activeDragEvent]);

  const handleDrop = async (date: Date) => {
    if (!activeDragEvent) {
      console.error("Nenhum evento ativo para arrastar");
      if (onUpdateCallback) onUpdateCallback(false);
      return;
    }
    
    if (!activeDragEvent.id) {
      console.error("Evento sem ID não pode ser arrastado:", activeDragEvent);
      toast({
        variant: "destructive",
        title: "Erro ao mover agendamento",
        description: "O evento não possui um ID válido.",
      });
      if (onUpdateCallback) onUpdateCallback(false);
      return;
    }
    
    const formattedDate = format(date, "yyyy-MM-dd");
    
    if (formattedDate === activeDragEvent.scheduled_date) {
      setIsDragging(false);
      setActiveDragEvent(null);
      if (onUpdateCallback) onUpdateCallback(false);
      return;
    }
    
    try {
      console.log(`Moving event ${activeDragEvent.id} from ${activeDragEvent.scheduled_date} to ${formattedDate}`);
      
      // Create update data
      const updateData = {
        ...activeDragEvent,
        scheduled_date: formattedDate
      };
      
      // Remove unnecessary fields
      delete (updateData as any).id;
      delete (updateData as any).service;
      delete (updateData as any).collaborator;
      delete (updateData as any).editorial_line;
      delete (updateData as any).product;
      delete (updateData as any).status;
      delete (updateData as any).client;
      delete (updateData as any).created_at;
      delete (updateData as any).updated_at;
      
      // Aplicar atualização otimista antes mesmo da chamada à API
      const contentSchedulesKey = ['content-schedules'];
      const infiniteContentSchedulesKey = ['infinite-content-schedules'];
      
      // Atualiza a visualização imediatamente - Otimista
      const cachedEvents = queryClient.getQueryData<CalendarEvent[]>(contentSchedulesKey);
      if (cachedEvents) {
        const updatedEvents = cachedEvents.map(event => {
          if (event.id === activeDragEvent.id) {
            return { ...event, scheduled_date: formattedDate };
          }
          return event;
        });
        queryClient.setQueryData(contentSchedulesKey, updatedEvents);
      }
      
      // Atualiza dados infinitos também - Otimista
      const infiniteData = queryClient.getQueryData<any>(infiniteContentSchedulesKey);
      if (infiniteData?.pages) {
        const updatedInfiniteData = {
          ...infiniteData,
          pages: infiniteData.pages.map((page: any) => {
            if (page.data) {
              return {
                ...page,
                data: page.data.map((event: CalendarEvent) => {
                  if (event.id === activeDragEvent.id) {
                    return { ...event, scheduled_date: formattedDate };
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
      
      // Update the event in the API
      await updateContentSchedule(activeDragEvent.id, updateData);
      
      // Show success toast
      toast({
        title: "Agendamento movido",
        description: `O agendamento foi movido para ${format(date, 'dd/MM/yyyy')} com sucesso.`,
      });
      
      // Force a refetch to ensure data consistency
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content-schedules'] }),
        queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] }),
        queryClient.invalidateQueries({ queryKey: ['scheduleHistory'] })
      ]);
      
      // SEMPRE chamar o callback após qualquer operação bem-sucedida
      if (onUpdateCallback) {
        console.log("Executando atualização manual após drag and drop bem sucedido");
        onUpdateCallback(true);
        
        // Garantir que a atualização seja feita várias vezes com delays 
        // para lidar com problemas de timing
        setTimeout(() => {
          onUpdateCallback(true);
        }, 100);
        
        setTimeout(() => {
          onUpdateCallback(true);
        }, 300);
        
        setTimeout(() => {
          onUpdateCallback(true);
        }, 600);
      }
      
    } catch (error) {
      console.error("Error moving event:", error);
      toast({
        variant: "destructive",
        title: "Erro ao mover agendamento",
        description: "Não foi possível mover o agendamento para a nova data.",
      });
      
      // If there's an error, refetch to restore the correct data
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      
      // Chamar o callback com falha
      if (onUpdateCallback) {
        onUpdateCallback(false);
      }
    } finally {
      setIsDragging(false);
      setActiveDragEvent(null);
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
