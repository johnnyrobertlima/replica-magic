
import { useState, useEffect, useCallback } from "react";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { useScheduleFormState } from "../../hooks/useScheduleFormState";
import { useScheduleMutations } from "../../hooks/useScheduleMutations";

interface UseMobileScheduleEventDialogProps {
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  selectedEvent?: CalendarEvent | undefined;
  initialTabActive?: "details" | "status" | "history" | "capture";
  onClose: () => void;
}

export function useScheduleEventDialog({
  clientId,
  selectedDate,
  events = [],
  selectedEvent,
  initialTabActive = "details",
  onClose
}: UseMobileScheduleEventDialogProps) {
  const [activeTab, setActiveTab] = useState<"details" | "status" | "history" | "capture">(initialTabActive);
  
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
    onClose
  });
  
  // Effect to select the event when it changes
  useEffect(() => {
    if (selectedEvent) {
      handleSelectEvent(selectedEvent);
    }
  }, [selectedEvent, handleSelectEvent]);
  
  // Wrapper for the submit function
  const submitForm = useCallback(
    (e: React.FormEvent) => {
      return handleSubmit(e, currentSelectedEvent, formData);
    },
    [handleSubmit, currentSelectedEvent, formData]
  );
  
  // Wrapper for the status update function
  const updateStatus = useCallback(
    (e: React.FormEvent) => {
      return handleStatusUpdate(e, currentSelectedEvent, formData);
    },
    [handleStatusUpdate, currentSelectedEvent, formData]
  );
  
  // Wrapper for the delete function
  const deleteEvent = useCallback(
    () => {
      return handleDelete(currentSelectedEvent);
    },
    [handleDelete, currentSelectedEvent]
  );

  return {
    currentSelectedEvent,
    formData,
    activeTab,
    isSubmitting,
    isDeleting,
    setActiveTab,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleDateTimeChange,
    handleAllDayChange,
    handleSubmit: submitForm,
    handleStatusUpdate: updateStatus,
    handleDelete: deleteEvent,
    handleSelectEvent,
    resetForm
  };
}
