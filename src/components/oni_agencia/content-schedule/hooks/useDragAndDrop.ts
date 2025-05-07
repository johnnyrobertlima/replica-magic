
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/oni-agencia";
import { updateContentSchedule } from "@/services/oniAgenciaContentScheduleServices";
import { format } from "date-fns";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

// Tipo para callback de atualização
type UpdateCallback = (success: boolean, eventId?: string) => void;

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
      
      // Salvar o evento atual para referência
      const eventId = activeDragEvent.id;
      const oldDate = activeDragEvent.scheduled_date;
      
      // Criar objeto de atualização
      const updateData = {
        ...activeDragEvent,
        scheduled_date: formattedDate
      };
      
      // Remover campos não necessários
      delete (updateData as any).id;
      delete (updateData as any).service;
      delete (updateData as any).collaborator;
      delete (updateData as any).editorial_line;
      delete (updateData as any).product;
      delete (updateData as any).status;
      delete (updateData as any).client;
      delete (updateData as any).created_at;
      delete (updateData as any).updated_at;
      
      // Aplicar atualização otimista ao cache do React Query
      const contentSchedulesKey = ['content-schedules'];
      const infiniteContentSchedulesKey = ['infinite-content-schedules'];
      
      // Aplicar atualização imediata no cache
      const cachedEvents = queryClient.getQueryData<CalendarEvent[]>(contentSchedulesKey);
      if (cachedEvents) {
        const updatedEvents = cachedEvents.map(event => {
          if (event.id === eventId) {
            return { ...event, scheduled_date: formattedDate };
          }
          return event;
        });
        queryClient.setQueryData(contentSchedulesKey, updatedEvents);
      }
      
      // Atualizar cache de dados infinitos
      const infiniteData = queryClient.getQueryData<any>(infiniteContentSchedulesKey);
      if (infiniteData?.pages) {
        const updatedInfiniteData = {
          ...infiniteData,
          pages: infiniteData.pages.map((page: any) => {
            if (page.data) {
              return {
                ...page,
                data: page.data.map((event: CalendarEvent) => {
                  if (event.id === eventId) {
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
      
      // Executar chamada à API
      await updateContentSchedule(eventId, updateData);
      
      // Registrar histórico da mudança
      console.log("Recording history for scheduled_date change:", {
        old: oldDate,
        new: formattedDate
      });
      
      // Exibir toast de sucesso
      toast({
        title: "Agendamento movido",
        description: `O agendamento foi movido para ${format(date, 'dd/MM/yyyy')} com sucesso.`,
      });
      
      console.log("Updated content schedule:", eventId);
      
      // Forçar invalidação completa dos dados
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['content-schedules'] }),
        queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] }),
        queryClient.invalidateQueries({ queryKey: ['scheduleHistory'] })
      ]);
      
      // Chamar o callback IMEDIATAMENTE para atualização da UI
      if (onUpdateCallback) {
        console.log("Chamando callback após drag and drop bem sucedido");
        onUpdateCallback(true, eventId);
      }
    } catch (error) {
      console.error("Error moving event:", error);
      toast({
        variant: "destructive",
        title: "Erro ao mover agendamento",
        description: "Não foi possível mover o agendamento para a nova data.",
      });
      
      // Se houver erro, fazer refetch para restaurar os dados corretos
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      
      // Chamar o callback com falha
      if (onUpdateCallback) {
        onUpdateCallback(false);
      }
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
