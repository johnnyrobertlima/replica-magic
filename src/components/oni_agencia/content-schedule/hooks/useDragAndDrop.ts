import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { updateContentSchedule } from "@/services/oniAgenciaContentScheduleServices";
import { format, parse } from "date-fns";
import { DragStartEvent, DragEndEvent } from "@dnd-kit/core";

// Helper function to convert string date to Date object
const parseStringToDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  try {
    if (dateString.includes('T')) {
      // If ISO format with time, still use parse but with a different format
      return parse(dateString, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx", new Date());
    }
    
    // Parse YYYY-MM-DD format to Date object using parse to avoid timezone issues
    return parse(dateString, 'yyyy-MM-dd', new Date());
  } catch (e) {
    console.error("Error parsing date string:", dateString, e);
    return null;
  }
};

export function useDragAndDrop() {
  const [isDragging, setIsDragging] = useState(false);
  const [activeDragEvent, setActiveDragEvent] = useState<CalendarEvent | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    console.log("Drag start event triggered:", event);
    console.log("Drag active element:", event.active);
    console.log("Drag event data:", event.active.data.current);
    
    // Extract the CalendarEvent from the draggable item's data
    const calendarEvent = event.active.data.current?.event as CalendarEvent;
    if (calendarEvent) {
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
      console.error("Drag started but no event data found:", event.active);
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
    
    if (event.over) {
      console.log("Drop target found:", event.over.id);
      console.log("Drop target data:", event.over.data.current);
      
      // Get the date from the droppable area's data
      const dropDate = event.over.data.current?.date as Date;
      
      if (dropDate) {
        console.log("Handling drop to date:", format(dropDate, 'yyyy-MM-dd'));
        handleDrop(dropDate);
      } else {
        console.error("Drop area has no date data:", event.over);
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
    
    setIsDragging(false);
    setActiveDragEvent(null);
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
    
    const formattedDate = format(date, "yyyy-MM-dd");
    console.log(`Attempting to move event from ${activeDragEvent.scheduled_date} to ${formattedDate}`);
    
    if (formattedDate === activeDragEvent.scheduled_date) {
      console.log("Source and destination dates are the same, cancelling move");
      setIsDragging(false);
      setActiveDragEvent(null);
      return;
    }
    
    try {
      console.log(`Moving event ${activeDragEvent.id} from ${activeDragEvent.scheduled_date} to ${formattedDate}`);
      
      // Create a proper ContentScheduleFormData object with all required fields
      const updateData: ContentScheduleFormData = {
        client_id: activeDragEvent.client_id,
        service_id: activeDragEvent.service_id,
        collaborator_id: activeDragEvent.collaborator_id,
        title: activeDragEvent.title,
        description: activeDragEvent.description,
        scheduled_date: date, // Use Date object directly
        execution_phase: activeDragEvent.execution_phase,
        editorial_line_id: activeDragEvent.editorial_line_id,
        product_id: activeDragEvent.product_id,
        status_id: activeDragEvent.status_id,
        creators: activeDragEvent.creators,
        // Convert string dates to Date objects if present using parse to avoid timezone issues
        capture_date: activeDragEvent.capture_date ? parseStringToDate(activeDragEvent.capture_date) : null,
        capture_end_date: activeDragEvent.capture_end_date ? parseStringToDate(activeDragEvent.capture_end_date) : null,
        is_all_day: activeDragEvent.is_all_day,
        location: activeDragEvent.location
      };
      
      // Remove unnecessary fields for API call
      const { 
        id, 
        service, 
        collaborator, 
        editorial_line, 
        product, 
        status, 
        client, 
        created_at, 
        updated_at,
        ...cleanData 
      } = activeDragEvent as any;
      
      // Convert to API format (strings) for the API call
      const apiData = {
        ...cleanData,
        scheduled_date: formattedDate,
        capture_date: updateData.capture_date instanceof Date ? format(updateData.capture_date, 'yyyy-MM-dd') : cleanData.capture_date,
        capture_end_date: updateData.capture_end_date instanceof Date ? format(updateData.capture_end_date, 'yyyy-MM-dd') : cleanData.capture_end_date
      };
      
      // Backup of the original event for use in case of error
      const originalEvent = { ...activeDragEvent };
      
      // Update the event in local state immediately
      const updatedEvent = {
        ...activeDragEvent,
        scheduled_date: formattedDate
      };
      
      // Immediately update all queries to reflect the change
      
      // 1. For standard query cache
      queryClient.setQueriesData({ queryKey: ['content-schedules'] }, (old: any) => {
        if (!old || !Array.isArray(old)) return old;
        
        console.log("Updating content-schedules cache");
        // Remove the old event and add the new one
        const filteredEvents = old.filter((event: CalendarEvent) => event.id !== activeDragEvent.id);
        return [...filteredEvents, updatedEvent];
      });
      
      // 2. For infinite query cache
      queryClient.setQueriesData({ queryKey: ['infinite-content-schedules'] }, (old: any) => {
        if (!old || !old.pages) return old;
        
        console.log("Updating infinite-content-schedules cache");
        const updatedPages = old.pages.map((page: any) => {
          if (!page.data) return page;
          
          // Remove the old event
          const filteredData = page.data.filter((event: CalendarEvent) => 
            event.id !== activeDragEvent.id
          );
          
          // Add the updated event to the page if it matches the date range
          const updatedData = [...filteredData];
          if (page.data.some((event: CalendarEvent) => 
            event.scheduled_date.substring(0, 7) === formattedDate.substring(0, 7)
          )) {
            updatedData.push(updatedEvent);
          }
          
          return { ...page, data: updatedData };
        });
        
        return {
          ...old,
          pages: updatedPages
        };
      });
      
      // Show "updating" toast
      toast({
        title: "Movendo agendamento...",
        description: "Aguarde enquanto atualizamos o agendamento.",
      });
      
      // Make the update API call with the correct event ID
      console.log("Making API call to update event with ID:", activeDragEvent.id);
      await updateContentSchedule(activeDragEvent.id, apiData);
      
      // Show success toast
      toast({
        title: "Agendamento movido",
        description: "O agendamento foi movido para outra data com sucesso.",
      });
      
      // Force a refetch to ensure data consistency
      console.log("Invalidating queries to refresh data");
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
      
      // If there's an error, refetch to restore the correct data
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
