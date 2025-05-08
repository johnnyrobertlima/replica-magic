
import { useMemo } from "react";
import { useScheduleFormState } from "@/hooks/oni_agencia/useScheduleFormState";
import { useScheduleResources } from "../content-schedule/hooks/useScheduleResources";
import { useScheduleMutations } from "../content-schedule/hooks/useScheduleMutations";
import { useEventsByDate } from "../content-schedule/hooks/useEventsByDate";
import { DialogContainer } from "./schedule-dialog/DialogContainer";
import { DialogContent } from "./schedule-dialog/DialogContent";
import { CalendarEvent } from "@/types/oni-agencia";

export interface ScheduleEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  onClose: () => void;
  selectedEvent?: CalendarEvent;
  onManualRefetch?: () => void;
  defaultTab?: "details" | "status" | "history" | "capture";
}

export function ScheduleEventDialog({
  isOpen,
  onOpenChange,
  clientId,
  selectedDate,
  events: propEvents,
  onClose,
  selectedEvent,
  onManualRefetch,
  defaultTab
}: ScheduleEventDialogProps) {
  // Get events for the selected date
  const { events: dateEvents, isLoading: isLoadingEvents } = useEventsByDate(clientId, selectedDate, !!isOpen);
  
  // Combine events from props and from the date query, removing duplicates
  const events = useMemo(() => {
    const allEvents = [...(propEvents || []), ...(dateEvents || [])];
    // Remove duplicates based on event ID
    const uniqueEvents = allEvents.reduce((acc, current) => {
      const eventExists = acc.find(item => item.id === current.id);
      if (!eventExists) {
        acc.push(current);
      }
      return acc;
    }, [] as CalendarEvent[]);
    
    return uniqueEvents;
  }, [propEvents, dateEvents]);
  
  // Form state management
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
    selectedEvent,
  });

  // Use schedule resources and mutations hooks
  const {
    services,
    collaborators,
    editorialLines,
    products,
    statuses,
    clients,
    isLoadingServices,
    isLoadingCollaborators,
    isLoadingEditorialLines,
    isLoadingProducts,
    isLoadingStatuses,
    isLoadingClients
  } = useScheduleResources(clientId);

  const {
    handleSubmit,
    handleDelete,
    isSubmitting,
    isDeleting,
    handleStatusUpdate
  } = useScheduleMutations({
    clientId,
    currentSelectedEvent,
    formData,
    onSuccess: () => {
      if (onManualRefetch) {
        onManualRefetch();
      }
      onClose();
    }
  });

  // Dialog title
  const dialogTitle = currentSelectedEvent ? "Editar Agendamento" : "Novo Agendamento";

  return (
    <DialogContainer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      selectedDate={selectedDate}
      onClose={onClose}
      title={dialogTitle}
    >
      <DialogContent
        selectedEvent={selectedEvent}
        events={events}
        currentSelectedEvent={currentSelectedEvent}
        clientId={clientId}
        selectedDate={selectedDate}
        services={services}
        collaborators={collaborators}
        editorialLines={editorialLines}
        products={products}
        statuses={statuses}
        clients={clients}
        isLoadingServices={isLoadingServices}
        isLoadingCollaborators={isLoadingCollaborators}
        isLoadingEditorialLines={isLoadingEditorialLines}
        isLoadingProducts={isLoadingProducts}
        isLoadingStatuses={isLoadingStatuses}
        isLoadingClients={isLoadingClients}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        formData={formData}
        onSelectEvent={handleSelectEvent}
        onResetForm={resetForm}
        onSubmit={handleSubmit}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
        onCancel={onClose}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onDateChange={handleDateChange}
        onDateTimeChange={handleDateTimeChange}
        onAllDayChange={handleAllDayChange}
        defaultTab={defaultTab}
      />
    </DialogContainer>
  );
}
