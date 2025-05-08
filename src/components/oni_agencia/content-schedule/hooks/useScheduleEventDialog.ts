
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
  onManualRefetch?: () => void; // Adicionamos essa prop
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
    handleDateTimeChange,  // New handler for date-time fields
    handleAllDayChange     // New handler for all-day toggle
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
    onManualRefetch // Passamos a função de atualização manual
  });

  // Configura o evento selecionado apenas quando ele vem das props e ainda não foi selecionado
  useEffect(() => {
    if (selectedEvent && !hasSelectedEventRef.current) {
      console.log('Setting explicitly selected event:', selectedEvent.id);
      handleSelectEvent(selectedEvent);
      hasSelectedEventRef.current = true;
    }
  }, [selectedEvent, handleSelectEvent]);

  // Wrapper para o submit que passa o evento selecionado e os dados do formulário
  const submitForm = (e: React.FormEvent) => {
    console.log("Submitting form:", formData);
    return handleSubmit(e, currentSelectedEvent, formData);
  };
  
  // Wrapper para atualizar status
  const updateStatus = (e: React.FormEvent) => {
    console.log("Updating status:", formData.status_id);
    return handleStatusUpdate(e, currentSelectedEvent, formData);
  };
  
  // Wrapper para excluir evento
  const deleteEvent = () => {
    console.log("Deleting event:", currentSelectedEvent?.id);
    return handleDelete(currentSelectedEvent);
  };
  
  // Função aprimorada para resetar o formulário
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
    handleDateTimeChange,  // Include new handlers in return
    handleAllDayChange,    // Include new handlers in return
    handleSubmit: submitForm,
    handleStatusUpdate: updateStatus,
    handleDelete: deleteEvent,
    handleSelectEvent,
    resetForm: handleResetForm
  };
}
