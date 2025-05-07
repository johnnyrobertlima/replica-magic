
import { useState, useEffect, useRef } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useScheduleFormState } from "./useScheduleFormState";
import { useScheduleMutations } from "./useScheduleMutations";

export function useScheduleEventDialog({
  clientId,
  selectedDate,
  events,
  selectedEvent,
  onManualRefetch,
  onClose
}: {
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  selectedEvent?: CalendarEvent;
  onManualRefetch?: () => void;
  onClose: () => void;
}) {
  // Add a ref to prevent multiple selections
  const hasSelectedEventRef = useRef(false);
  const [activeTab, setActiveTab] = useState<"details" | "status" | "history">("details");
  
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
    onClose,
    clientId,
    selectedDate,
    onManualRefetch, // Pass onManualRefetch down to useScheduleMutations
  });

  // Only set the selectedEvent when it comes from props and not already selected
  useEffect(() => {
    if (selectedEvent && !hasSelectedEventRef.current) {
      console.log('Setting explicitly selected event:', selectedEvent.id);
      handleSelectEvent(selectedEvent);
      hasSelectedEventRef.current = true;
    }
  }, [selectedEvent, handleSelectEvent]);

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
    handleSubmit,
    handleStatusUpdate,
    handleDelete,
    handleSelectEvent,
    resetForm: handleResetForm
  };
}
