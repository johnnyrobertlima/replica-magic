
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

  // Only auto-select the event if there's only one event AND a specific event wasn't already selected
  // This ensures empty areas work as expected for creating new events
  useEffect(() => {
    if (!selectedEvent && events.length === 1 && !currentSelectedEvent) {
      // Only auto-select if events are for this specific date
      const eventDate = events[0].scheduled_date;
      const currentDateStr = selectedDate.toISOString().split('T')[0];
      
      if (eventDate === currentDateStr) {
        handleSelectEvent(events[0]);
      }
    }
  }, [events, selectedEvent, currentSelectedEvent, selectedDate, handleSelectEvent]);

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
