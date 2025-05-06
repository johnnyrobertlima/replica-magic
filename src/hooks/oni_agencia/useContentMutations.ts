
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  createContentSchedule, 
  updateContentSchedule, 
  deleteContentSchedule 
} from "@/services/oniAgenciaContentScheduleServices";
import { ContentScheduleFormData, CalendarEvent } from "@/types/oni-agencia";

export function useCreateContentSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ContentScheduleFormData) => {
      console.log("Creating content schedule with data:", data);
      return createContentSchedule(data);
    },
    onSuccess: (response, variables) => {
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });
      
      // Try to update the cache with our newly created event if response contains the ID
      if (response && response.id) {
        // For standard queries
        const eventsCacheKey = ['content-schedules'];
        const cachedEvents = queryClient.getQueryData<CalendarEvent[]>(eventsCacheKey);
        
        if (cachedEvents) {
          const newEvent = {
            ...response,
            ...variables,
          } as CalendarEvent;
          
          queryClient.setQueryData(eventsCacheKey, [...cachedEvents, newEvent]);
        }
        
        // For infinite queries
        const infiniteCacheKey = ['infinite-content-schedules'];
        const infiniteData = queryClient.getQueryData<any>(infiniteCacheKey);
        
        if (infiniteData && infiniteData.pages && infiniteData.pages.length > 0) {
          const newEvent = {
            ...response,
            ...variables,
          } as CalendarEvent;
          
          // Add to the first page
          const updatedPages = [...infiniteData.pages];
          if (updatedPages[0].data) {
            updatedPages[0] = {
              ...updatedPages[0],
              data: [newEvent, ...updatedPages[0].data]
            };
            
            queryClient.setQueryData(infiniteCacheKey, {
              ...infiniteData,
              pages: updatedPages
            });
          }
        }
      }
      
      // Invalidate all content schedules queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    },
    onError: (error) => {
      console.error("Error creating content schedule:", error);
      toast({
        variant: "destructive",
        title: "Erro ao criar agendamento",
        description: "Não foi possível criar o agendamento. Tente novamente.",
      });
    }
  });
}

export function useUpdateContentSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ContentScheduleFormData }) => {
      console.log("Updating content schedule with id:", id, "data:", data);
      return updateContentSchedule(id, data);
    },
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['content-schedules'] });
      await queryClient.cancelQueries({ queryKey: ['infinite-content-schedules'] });
      
      // For standard queries - update the event in cache immediately
      const eventsCacheKey = ['content-schedules'];
      const cachedEvents = queryClient.getQueryData<CalendarEvent[]>(eventsCacheKey);
      
      if (cachedEvents) {
        const updatedEvents = cachedEvents.map(event => {
          if (event.id === id) {
            return {
              ...event,
              ...data,
              // Preserve important nested objects that aren't included in the update
              service: event.service,
              collaborator: event.collaborator,
              editorial_line: event.editorial_line,
              product: event.product,
              status: data.status_id !== event.status_id 
                ? { ...event.status, id: data.status_id } 
                : event.status,
              client: event.client
            };
          }
          return event;
        });
        
        // Update the query cache with our optimistically modified data
        queryClient.setQueryData(eventsCacheKey, updatedEvents);
      }
      
      // For infinite queries - update the event in all pages
      const infiniteCacheKey = ['infinite-content-schedules'];
      const infiniteData = queryClient.getQueryData<any>(infiniteCacheKey);
      
      if (infiniteData && infiniteData.pages) {
        const updatedPages = infiniteData.pages.map((page: any) => {
          if (page.data) {
            const updatedData = page.data.map((event: CalendarEvent) => {
              if (event.id === id) {
                return {
                  ...event,
                  ...data,
                  // Preserve important nested objects that aren't included in the update
                  service: event.service,
                  collaborator: event.collaborator,
                  editorial_line: event.editorial_line,
                  product: event.product,
                  status: data.status_id !== event.status_id 
                    ? { ...event.status, id: data.status_id } 
                    : event.status,
                  client: event.client
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
    },
    onSuccess: () => {
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso.",
      });
      
      // Invalidate all queries related to content schedules to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['scheduleHistory'] });
    },
    onError: (error) => {
      console.error("Error updating content schedule:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar agendamento",
        description: "Não foi possível atualizar o agendamento. Tente novamente.",
      });
      
      // If there's an error, we should refetch to restore the correct data
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    }
  });
}

export function useDeleteContentSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("Deleting content schedule with id:", id);
      return deleteContentSchedule(id);
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['content-schedules'] });
      await queryClient.cancelQueries({ queryKey: ['infinite-content-schedules'] });
      
      // For standard queries - remove the event from cache immediately
      const eventsCacheKey = ['content-schedules'];
      const cachedEvents = queryClient.getQueryData<CalendarEvent[]>(eventsCacheKey);
      
      if (cachedEvents) {
        const filteredEvents = cachedEvents.filter(event => event.id !== id);
        queryClient.setQueryData(eventsCacheKey, filteredEvents);
      }
      
      // For infinite queries - remove the event from all pages
      const infiniteCacheKey = ['infinite-content-schedules'];
      const infiniteData = queryClient.getQueryData<any>(infiniteCacheKey);
      
      if (infiniteData && infiniteData.pages) {
        const updatedPages = infiniteData.pages.map((page: any) => {
          if (page.data) {
            const filteredData = page.data.filter((event: CalendarEvent) => event.id !== id);
            return { ...page, data: filteredData };
          }
          return page;
        });
        
        queryClient.setQueryData(infiniteCacheKey, {
          ...infiniteData,
          pages: updatedPages
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso.",
      });
      
      // Invalidate all content schedules queries to force refetch
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    },
    onError: (error) => {
      console.error("Error deleting content schedule:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir agendamento",
        description: "Não foi possível excluir o agendamento. Tente novamente.",
      });
      
      // If there's an error, we should refetch to restore the correct data
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    }
  });
}
