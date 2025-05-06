
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/oni-agencia";
import { updateContentSchedule } from "@/services/oniAgenciaContentScheduleServices";
import { format } from "date-fns";
import { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";

export function useDragAndDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [activeDragEvent, setActiveDragEvent] = useState<CalendarEvent | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDragStart = (event: DragStartEvent) => {
    // Extract the CalendarEvent from the draggable item's data
    const calendarEvent = event.active.data.current?.event as CalendarEvent;
    if (calendarEvent) {
      setIsDragging(true);
      setActiveDragEvent(calendarEvent);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (activeDragEvent && event.over) {
      // Get the date from the droppable area's data
      const dropDate = event.over.data.current?.date as Date;
      if (dropDate) {
        handleDrop(dropDate);
      }
    }
    
    setIsDragging(false);
    setActiveDragEvent(null);
  };

  const handleDrop = async (date: Date) => {
    if (!activeDragEvent) return;
    
    const formattedDate = format(date, "yyyy-MM-dd");
    
    if (formattedDate === activeDragEvent.scheduled_date) {
      setIsDragging(false);
      setActiveDragEvent(null);
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
      
      // Do optimistic updates to all relevant caches first
      // 1. For standard query cache
      const eventsCacheKey = ['content-schedules'];
      const cachedEvents = queryClient.getQueryData<CalendarEvent[]>(eventsCacheKey);
      
      if (cachedEvents) {
        // Update the cache with the modified event
        const updatedEvents = cachedEvents.map(event => {
          if (event.id === activeDragEvent.id) {
            return {
              ...event,
              scheduled_date: formattedDate
            };
          }
          return event;
        });
        
        // Update the query cache with our modified data
        queryClient.setQueryData(eventsCacheKey, updatedEvents);
      }
      
      // 2. For infinite query cache
      const infiniteCacheKey = ['infinite-content-schedules'];
      const infiniteData = queryClient.getQueryData<any>(infiniteCacheKey);
      
      if (infiniteData && infiniteData.pages) {
        const updatedPages = infiniteData.pages.map((page: any) => {
          if (page.data) {
            const updatedData = page.data.map((event: CalendarEvent) => {
              if (event.id === activeDragEvent.id) {
                return {
                  ...event,
                  scheduled_date: formattedDate
                };
              }
              return event;
            });
            return { ...page, data: updatedData };
          }
          return page;
        });
        
        queryClient.setQueryData(infiniteCacheKey, {
          ...infiniteData,
          pages: updatedPages
        });
      }
      
      // Make the update API call
      await updateContentSchedule(activeDragEvent.id, updateData);
      
      // Show success toast
      toast({
        title: "Agendamento movido",
        description: "O agendamento foi movido para outra data com sucesso.",
      });
      
      // Force data refresh after our optimistic update
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['scheduleHistory'] });
      
    } catch (error) {
      console.error("Error moving event:", error);
      toast({
        variant: "destructive",
        title: "Erro ao mover agendamento",
        description: "Não foi possível mover o agendamento para a nova data.",
      });
      
      // If there's an error, we should refetch to restore the correct data
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
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
