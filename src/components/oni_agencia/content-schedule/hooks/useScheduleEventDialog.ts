
import { useState, useEffect, useRef, useCallback } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useScheduleFormState } from "./useScheduleFormState";
import { useScheduleMutations } from "./useScheduleMutations";
import { useQueryClient } from "@tanstack/react-query";

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

  // Função para atualização forçada com múltiplas chamadas
  const forceRefresh = useCallback(() => {
    if (!onManualRefetch) return;
    
    console.log("Forçando atualização de dados após operação");
    // Primeira chamada imediata
    onManualRefetch();
    
    // Chamadas adicionais com intervalos crescentes
    setTimeout(() => onManualRefetch(), 150);
    setTimeout(() => onManualRefetch(), 400);
    setTimeout(() => onManualRefetch(), 800);
  }, [onManualRefetch]);

  const {
    isSubmitting,
    isDeleting,
    handleSubmit,
    handleStatusUpdate,
    handleDelete
  } = useScheduleMutations({
    onClose: () => {
      // Primeiro executamos o callback de fechamento
      onClose();
      
      // Depois forçamos o refresh dos dados
      forceRefresh();
    },
    clientId,
    selectedDate,
    onManualRefetch: forceRefresh // Pass our enhanced forceRefresh function
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
