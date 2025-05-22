
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
  const [isUserEditing, setIsUserEditing] = useState(false);
  
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
  
  // Wrap the form input change handlers to track user editing
  const handleAnyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsUserEditing(true);
    handleInputChange(e);
  };
  
  const handleAnySelectChange = (name: string, value: string) => {
    setIsUserEditing(true);
    handleSelectChange(name, value);
  };
  
  const handleAnyDateChange = (name: string, value: Date | null) => {
    setIsUserEditing(true);
    handleDateChange(name, value);
  };
  
  const handleAnyDateTimeChange = (name: string, value: Date | null) => {
    setIsUserEditing(true);
    handleDateTimeChange(name, value);
  };
  
  const handleAnyAllDayChange = (value: boolean) => {
    setIsUserEditing(true);
    handleAllDayChange(value);
  };
  
  // Wrapper for the submit function
  const submitForm = useCallback(
    (e: React.FormEvent) => {
      setIsUserEditing(false);
      return handleSubmit(e, currentSelectedEvent, formData);
    },
    [handleSubmit, currentSelectedEvent, formData]
  );
  
  // Wrapper for the status update function
  const updateStatus = useCallback(
    (e: React.FormEvent) => {
      setIsUserEditing(false);
      return handleStatusUpdate(e, currentSelectedEvent, formData);
    },
    [handleStatusUpdate, currentSelectedEvent, formData]
  );
  
  // Wrapper for the delete function
  const deleteEvent = useCallback(
    () => {
      setIsUserEditing(false);
      return handleDelete(currentSelectedEvent);
    },
    [handleDelete, currentSelectedEvent]
  );
  
  // Enhanced close function to ensure we prompt the user if they have unsaved changes
  const handleDialogClose = useCallback(() => {
    if (isUserEditing && !isSubmitting && !isDeleting) {
      if (window.confirm("Você tem alterações não salvas. Deseja realmente fechar?")) {
        setIsUserEditing(false);
        onClose();
      }
    } else {
      onClose();
    }
  }, [isUserEditing, isSubmitting, isDeleting, onClose]);
  
  // Enhanced reset form function
  const enhancedResetForm = useCallback(() => {
    setIsUserEditing(false);
    resetForm();
  }, [resetForm]);

  return {
    currentSelectedEvent,
    formData,
    activeTab,
    isSubmitting,
    isDeleting,
    isUserEditing,
    setActiveTab,
    handleInputChange: handleAnyInputChange,
    handleSelectChange: handleAnySelectChange,
    handleDateChange: handleAnyDateChange,
    handleDateTimeChange: handleAnyDateTimeChange,
    handleAllDayChange: handleAnyAllDayChange,
    handleSubmit: submitForm,
    handleStatusUpdate: updateStatus,
    handleDelete: deleteEvent,
    handleSelectEvent,
    handleDialogClose,
    resetForm: enhancedResetForm
  };
}
