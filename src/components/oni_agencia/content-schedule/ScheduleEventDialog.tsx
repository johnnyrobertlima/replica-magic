
import { useMemo } from "react";
import { useScheduleFormState } from "@/hooks/oni_agencia/useScheduleFormState";
import { useScheduleResources } from "./hooks/useScheduleResources";
import { useScheduleMutations } from "./hooks/useScheduleMutations";
import { useEventsByDate } from "./hooks/useEventsByDate";
import { DialogContainer } from "./schedule-dialog/DialogContainer";
import { DialogContent } from "./schedule-dialog/DialogContent";
import { CalendarEvent } from "@/types/oni-agencia";
import { format } from "date-fns";

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
  prioritizeCaptureDate?: boolean;
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
  prioritizeCaptureDate = false
}: ScheduleEventDialogProps) {
  // Get events for the selected date - pass prioritizeCaptureDate to determine which date field to use
  const { events: dateEvents, isLoading: isLoadingEvents } = useEventsByDate(
    clientId, 
    selectedDate, 
    !!isOpen,
    prioritizeCaptureDate // Pass this flag to useEventsByDate
  );
  
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
  
  // Form state management - passando uma cópia da data para evitar problemas de referência
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
    selectedDate: new Date(selectedDate),
    selectedEvent,
    prioritizeCaptureDate,
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

  // Função auxiliar para formatar a data ao enviar para a API
  const prepareDataForAPI = (data: typeof formData) => {
    // Clone o objeto para não modificar o original
    const preparedData = { ...data };
    
    // Converter objetos Date para o formato esperado pela API
    if (preparedData.scheduled_date && preparedData.scheduled_date instanceof Date) {
      preparedData.scheduled_date = format(preparedData.scheduled_date, 'yyyy-MM-dd');
    }
    
    if (preparedData.capture_date && preparedData.capture_date instanceof Date) {
      if (preparedData.is_all_day) {
        preparedData.capture_date = format(preparedData.capture_date, 'yyyy-MM-dd');
      } else {
        preparedData.capture_date = format(preparedData.capture_date, "yyyy-MM-dd'T'HH:mm:ss");
      }
    }
    
    if (preparedData.capture_end_date && preparedData.capture_end_date instanceof Date) {
      if (preparedData.is_all_day) {
        preparedData.capture_end_date = format(preparedData.capture_end_date, 'yyyy-MM-dd');
      } else {
        preparedData.capture_end_date = format(preparedData.capture_end_date, "yyyy-MM-dd'T'HH:mm:ss");
      }
    }
    
    return preparedData;
  };

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
    // Converter os objetos Date para strings no formato esperado pela API
    const preparedData = prepareDataForAPI(formData);
    await submitEvent(e, currentSelectedEvent, preparedData);
  };
  
  const handleStatusUpdate = async (e: React.FormEvent) => {
    // Converter os objetos Date para strings no formato esperado pela API
    const preparedData = prepareDataForAPI(formData);
    await updateStatus(e, currentSelectedEvent, preparedData);
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
        prioritizeCaptureDate={prioritizeCaptureDate}
      />
    </DialogContainer>
  );
}
