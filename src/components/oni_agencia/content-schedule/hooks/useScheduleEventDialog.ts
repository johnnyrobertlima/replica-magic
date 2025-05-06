
import { useEffect, useState, useRef } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useScheduleFormState } from "./useScheduleFormState";
import { useScheduleMutations } from "./useScheduleMutations";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";

export function useScheduleEventDialog({
  clientId,
  selectedDate,
  events,
  selectedEvent,
  onClose
}: {
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  selectedEvent?: CalendarEvent;
  onClose: () => void;
}) {
  // Add a ref to prevent multiple selections
  const hasSelectedEventRef = useRef(false);
  const queryClient = useQueryClient();
  
  const {
    currentSelectedEvent,
    formData,
    resetForm,
    handleSelectEvent,
    handleInputChange,
    handleSelectChange,
    handleDateChange
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
    return handleSubmit(e, currentSelectedEvent, formData);
  };
  
  const updateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating status:", formData.status_id);
    return handleStatusUpdate(e, currentSelectedEvent, formData);
  };
  
  const deleteEvent = () => {
    console.log("Deleting event:", currentSelectedEvent?.id);
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
    isSubmitting,
    isDeleting,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit: submitForm,
    handleStatusUpdate: updateStatus,
    handleDelete: deleteEvent,
    handleSelectEvent,
    resetForm: handleResetForm
  };
}
