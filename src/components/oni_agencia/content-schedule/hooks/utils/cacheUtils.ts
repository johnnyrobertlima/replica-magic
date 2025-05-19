
import { QueryClient } from "@tanstack/react-query";
import { CalendarEvent } from "@/types/oni-agencia";
import { formatDateToString } from "./dateUtils";

/**
 * Updates the content schedules cache with an updated event
 */
export const updateContentSchedulesCache = (
  queryClient: QueryClient,
  originalEvent: CalendarEvent,
  updatedEvent: CalendarEvent
) => {
  // Update standard query cache
  queryClient.setQueriesData({ queryKey: ['content-schedules'] }, (old: any) => {
    if (!old || !Array.isArray(old)) return old;
    
    console.log("Updating content-schedules cache");
    // Remove the old event and add the new one
    const filteredEvents = old.filter((event: CalendarEvent) => event.id !== originalEvent.id);
    return [...filteredEvents, updatedEvent];
  });
  
  // Update infinite query cache
  queryClient.setQueriesData({ queryKey: ['infinite-content-schedules'] }, (old: any) => {
    if (!old || !old.pages) return old;
    
    console.log("Updating infinite-content-schedules cache");
    const updatedPages = old.pages.map((page: any) => {
      if (!page.data) return page;
      
      // Remove the old event
      const filteredData = page.data.filter((event: CalendarEvent) => 
        event.id !== originalEvent.id
      );
      
      // Add the updated event to the page if it matches the date range
      const updatedData = [...filteredData];
      if (page.data.some((event: CalendarEvent) => 
        event.scheduled_date.substring(0, 7) === updatedEvent.scheduled_date.substring(0, 7)
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
};

/**
 * Invalidate all relevant queries after an event update
 */
export const invalidateScheduleQueries = (queryClient: QueryClient) => {
  queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
  queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
  queryClient.invalidateQueries({ queryKey: ['scheduleHistory'] });
};
