
import { useState, useEffect, useRef } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useScheduleFormState } from "../../hooks/useScheduleFormState";
import { useScheduleMutations } from "../../hooks/useScheduleMutations";
import { useQueryClient } from "@tanstack/react-query";

export function useScheduleEventDialog({
  clientId,
  selectedDate,
  events,
  selectedEvent,
  initialTabActive = "details",
  onClose
}: {
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  selectedEvent?: CalendarEvent;
  initialTabActive?: "details" | "status" | "history" | "capture";
  onClose: () => void;
}) {
  // Add a ref to prevent multiple selections
  const hasSelectedEventRef = useRef(false);
  const [activeTab, setActiveTab] = useState<"details" | "status" | "history" | "capture">(initialTabActive);
  const queryClient = useQueryClient();
  
  const {
    currentSelectedEvent,
    formData,
    resetForm,
    handleSelectEvent,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleDateTimeChange,  // New handler
    handleAllDayChange     // New handler
  } = useScheduleFormState({
    clientId,
    selectedDate,
    selectedEvent
  });

  const {
    isSubmitting,
    isDeleting,
    handleSubmit,
    handleStatusUpdate,
    handleDelete
  } = useScheduleMutations({
    onClose: () => {
      // Force a data refresh when closing the dialog
      queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
      onClose();
    },
    clientId,
    selectedDate
  });

  // Only set the selectedEvent when it comes from props and not already selected
  useEffect(() => {
    if (selectedEvent && !hasSelectedEventRef.current) {
      console.log('Setting explicitly selected event:', selectedEvent.id);
      handleSelectEvent(selectedEvent);
      hasSelectedEventRef.current = true;
    }
  }, [selectedEvent, handleSelectEvent]);

  // Create wrapper functions to pass the current state
  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form:", formData);
    
    // Apply optimistic update if we have a selected event (for editing)
    if (currentSelectedEvent) {
      // For standard queries
      const eventsCacheKey = ['content-schedules'];
      const cachedEvents = queryClient.getQueryData<CalendarEvent[]>(eventsCacheKey);
      
      if (cachedEvents) {
        const updatedEvents = cachedEvents.map(event => {
          if (event.id === currentSelectedEvent.id) {
            return {
              ...event,
              ...formData,
              // Preserve important nested objects
              service: event.service,
              collaborator: event.collaborator,
              editorial_line: event.editorial_line,
              product: event.product,
              status: formData.status_id !== event.status_id 
                ? { ...event.status, id: formData.status_id } 
                : event.status,
              client: event.client
            };
          }
          return event;
        });
        
        queryClient.setQueryData(eventsCacheKey, updatedEvents);
      }
      
      // For infinite query
      const infiniteCacheKey = ['infinite-content-schedules'];
      const infiniteData = queryClient.getQueryData<any>(infiniteCacheKey);
      
      if (infiniteData && infiniteData.pages) {
        const updatedPages = infiniteData.pages.map((page: any) => {
          if (page.data) {
            const updatedData = page.data.map((event: CalendarEvent) => {
              if (event.id === currentSelectedEvent.id) {
                return {
                  ...event,
                  ...formData,
                  // Preserve important nested objects
                  service: event.service,
                  collaborator: event.collaborator,
                  editorial_line: event.editorial_line,
                  product: event.product,
                  status: formData.status_id !== event.status_id 
                    ? { ...event.status, id: formData.status_id } 
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
    }
    
    return handleSubmit(e, currentSelectedEvent, formData);
  };
  
  const updateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating status:", formData.status_id);
    
    // Apply optimistic update for status change
    if (currentSelectedEvent) {
      // For standard queries
      const eventsCacheKey = ['content-schedules'];
      const cachedEvents = queryClient.getQueryData<CalendarEvent[]>(eventsCacheKey);
      
      if (cachedEvents) {
        const updatedEvents = cachedEvents.map(event => {
          if (event.id === currentSelectedEvent.id) {
            const updatedEvent = {
              ...event,
              status_id: formData.status_id,
              // Update the status object too
              status: event.status ? {
                ...event.status,
                id: formData.status_id
              } : undefined
            };
            return updatedEvent;
          }
          return event;
        });
        
        queryClient.setQueryData(eventsCacheKey, updatedEvents);
      }
      
      // For infinite query
      const infiniteCacheKey = ['infinite-content-schedules'];
      const infiniteData = queryClient.getQueryData<any>(infiniteCacheKey);
      
      if (infiniteData && infiniteData.pages) {
        const updatedPages = infiniteData.pages.map((page: any) => {
          if (page.data) {
            const updatedData = page.data.map((event: CalendarEvent) => {
              if (event.id === currentSelectedEvent.id) {
                const updatedEvent = {
                  ...event,
                  status_id: formData.status_id,
                  // Update the status object too
                  status: event.status ? {
                    ...event.status,
                    id: formData.status_id
                  } : undefined
                };
                return updatedEvent;
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
    }
    
    return handleStatusUpdate(e, currentSelectedEvent, formData);
  };
  
  const deleteEvent = () => {
    console.log("Deleting event:", currentSelectedEvent?.id);
    
    // Apply optimistic deletion
    if (currentSelectedEvent) {
      // For standard queries
      const eventsCacheKey = ['content-schedules'];
      const cachedEvents = queryClient.getQueryData<CalendarEvent[]>(eventsCacheKey);
      
      if (cachedEvents) {
        const filteredEvents = cachedEvents.filter(event => event.id !== currentSelectedEvent.id);
        queryClient.setQueryData(eventsCacheKey, filteredEvents);
      }
      
      // For infinite query
      const infiniteCacheKey = ['infinite-content-schedules'];
      const infiniteData = queryClient.getQueryData<any>(infiniteCacheKey);
      
      if (infiniteData && infiniteData.pages) {
        const updatedPages = infiniteData.pages.map((page: any) => {
          if (page.data) {
            const filteredData = page.data.filter((event: CalendarEvent) => 
              event.id !== currentSelectedEvent.id
            );
            return { ...page, data: filteredData };
          }
          return page;
        });
        
        queryClient.setQueryData(infiniteCacheKey, {
          ...infiniteData,
          pages: updatedPages
        });
      }
    }
    
    return handleDelete(currentSelectedEvent);
  };
  
  // Enhanced reset form function
  const handleResetForm = () => {
    console.log("Enhanced reset form called");
    hasSelectedEventRef.current = false;
    resetForm();
  };

  return {
    currentSelectedEvent,
    formData,
    activeTab,
    setActiveTab,
    isSubmitting,
    isDeleting,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleDateTimeChange,  // Include in return
    handleAllDayChange,    // Include in return
    handleSubmit: submitForm,
    handleStatusUpdate: updateStatus,
    handleDelete: deleteEvent,
    handleSelectEvent,
    resetForm: handleResetForm
  };
}
