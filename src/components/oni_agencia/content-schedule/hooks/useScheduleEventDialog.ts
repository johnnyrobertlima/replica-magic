
import { useState, useEffect, useRef } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useScheduleFormState } from "./useScheduleFormState";
import { useScheduleMutations } from "./useScheduleMutations";
import { useQueryClient } from "@tanstack/react-query";

interface UseScheduleEventDialogProps {
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  selectedEvent?: CalendarEvent;
  onClose: () => void;
  onManualRefetch?: () => void;
}

export function useScheduleEventDialog({
  clientId,
  selectedDate,
  events,
  selectedEvent,
  onClose,
  onManualRefetch
}: UseScheduleEventDialogProps) {
  const hasSelectedEventRef = useRef(false);
  const queryClient = useQueryClient();
  
  const {
    currentSelectedEvent,
    formData,
    resetForm,
    handleSelectEvent,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleDateTimeChange,
    handleAllDayChange
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
    clientId,
    selectedDate,
    onManualRefetch,
    onClose  // Now passing onClose properly
  });

  // Configure the selected event only when it comes from props and hasn't been selected yet
  useEffect(() => {
    if (selectedEvent && !hasSelectedEventRef.current) {
      console.log('Setting explicitly selected event:', selectedEvent.id);
      handleSelectEvent(selectedEvent);
      hasSelectedEventRef.current = true;
    }
  }, [selectedEvent, handleSelectEvent]);

  // Wrapper for the submit that passes the event selected and the form data
  const submitForm = (e: React.FormEvent) => {
    console.log("Submitting form:", formData);
    return handleSubmit(e, currentSelectedEvent, formData);
  };
  
  // Wrapper to update status
  const updateStatus = (e: React.FormEvent) => {
    console.log("Updating status:", formData.status_id);
    return handleStatusUpdate(e, currentSelectedEvent, formData);
  };
  
  // Wrapper to delete event
  const deleteEvent = () => {
    console.log("Deleting event:", currentSelectedEvent?.id);
    return handleDelete(currentSelectedEvent);
  };
  
  // Enhanced function to reset the form
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
    handleDateTimeChange,
    handleAllDayChange,
    handleSubmit: submitForm,
    handleStatusUpdate: updateStatus,
    handleDelete: deleteEvent,
    handleSelectEvent,
    resetForm: handleResetForm
  };
}
