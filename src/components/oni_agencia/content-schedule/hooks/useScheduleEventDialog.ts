
import { useEffect, useState } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useScheduleFormState } from "./useScheduleFormState";
import { useScheduleMutations } from "./useScheduleMutations";

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
  const {
    currentSelectedEvent,
    formData,
    resetForm,
    handleSelectEvent,
    handleInputChange,
    handleSelectChange
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
    onClose,
    clientId,
    selectedDate
  });

  // Handle case when there's only one event and no specific selection
  useEffect(() => {
    if (!selectedEvent && events.length === 1 && !currentSelectedEvent) {
      handleSelectEvent(events[0]);
    }
  }, [events, selectedEvent, currentSelectedEvent]);

  // Create wrapper functions to pass the current state
  const submitForm = (e: React.FormEvent) => handleSubmit(e, currentSelectedEvent, formData);
  const updateStatus = (e: React.FormEvent) => handleStatusUpdate(e, currentSelectedEvent, formData);
  const deleteEvent = () => handleDelete(currentSelectedEvent);
  
  // Enhanced reset form function
  const handleResetForm = () => {
    console.log("Enhanced reset form called");
    resetForm();
  };

  return {
    currentSelectedEvent,
    formData,
    isSubmitting,
    isDeleting,
    handleInputChange,
    handleSelectChange,
    handleSubmit: submitForm,
    handleStatusUpdate: updateStatus,
    handleDelete: deleteEvent,
    handleSelectEvent,
    resetForm: handleResetForm
  };
}
