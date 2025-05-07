
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
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Função para atualização forçada com throttling
  const forceRefresh = useCallback(() => {
    if (!onManualRefetch) return;
    
    // Clear any pending timeouts
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    
    console.log("Forçando atualização de dados após operação");
    
    // Invalidate queries first
    queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
    queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    
    // Primeira chamada imediata
    onManualRefetch();
    
    // Schedule additional calls with increasing delays
    updateTimeoutRef.current = setTimeout(() => {
      console.log("Executando atualização extra após (300ms)");
      onManualRefetch();
      
      // Final refresh after more delay
      updateTimeoutRef.current = setTimeout(() => {
        console.log("Executando atualização extra após (800ms)");
        onManualRefetch();
        updateTimeoutRef.current = null;
      }, 500);
    }, 300);
  }, [onManualRefetch, queryClient]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

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
