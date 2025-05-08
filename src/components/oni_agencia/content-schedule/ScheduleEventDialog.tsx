
import { useMemo } from "react";
import { useScheduleFormState } from "@/hooks/oni_agencia/useScheduleFormState";
import { useScheduleResources } from "./hooks/useScheduleResources";
import { useScheduleMutations } from "./hooks/useScheduleMutations";
import { useEventsByDate } from "./hooks/useEventsByDate";
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
  prioritizeCaptureDate?: boolean; // Novo parâmetro
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
  defaultTab,
  prioritizeCaptureDate = false // Valor padrão é false
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
    prioritizeCaptureDate, // Passamos o parâmetro para o hook de estado do formulário
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
    handleSubmit: submitEvent,
    handleDelete: deleteEvent,
    isSubmitting,
    isDeleting,
    handleStatusUpdate: updateStatus
  } = useScheduleMutations({
    clientId,
    selectedDate,
    onClose,
    onManualRefetch
  });
  
  // Wrap handlers to match expected function signatures
  const handleSubmit = async (e: React.FormEvent) => {
    await submitEvent(e, currentSelectedEvent, formData);
  };
  
  const handleStatusUpdate = async (e: React.FormEvent) => {
    await updateStatus(e, currentSelectedEvent, formData);
  };
  
  const handleDelete = async () => {
    await deleteEvent(currentSelectedEvent);
  };

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
        prioritizeCaptureDate={prioritizeCaptureDate} // Passa o parâmetro para o conteúdo do diálogo
      />
    </DialogContainer>
  );
}
