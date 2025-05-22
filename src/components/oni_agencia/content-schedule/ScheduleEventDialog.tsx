
import { useMemo, useEffect, useState } from "react";
import { useScheduleFormState } from "@/hooks/oni_agencia/useScheduleFormState";
import { useScheduleResources } from "./hooks/useScheduleResources";
import { useScheduleMutations } from "./hooks/useScheduleMutations";
import { useEventsByDate } from "./hooks/useEventsByDate";
import { DialogContainer } from "./schedule-dialog/DialogContainer";
import { DialogContent } from "./schedule-dialog/DialogContent";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
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
  // Add state to track loading and prevent loops
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Log dialog state for debugging
  useEffect(() => {
    console.log(`ScheduleEventDialog - isOpen: ${isOpen}, clientId: ${clientId}, selectedDate: ${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'undefined'}`);
    
    // Mark as initialized once component mounts
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isOpen, clientId, selectedDate, isInitialized]);

  // Force reset form when opening dialog for new event
  useEffect(() => {
    if (isOpen && !selectedEvent) {
      console.log("Dialog opened for new event - resetting form");
      resetForm();
    }
  }, [isOpen, selectedEvent]);

  // Get events for the selected date - pass prioritizeCaptureDate to determine which date field to use
  // Only enable query when dialog is open and we have clientId and selectedDate
  const { events: dateEvents, isLoading: isLoadingEvents } = useEventsByDate(
    clientId, 
    selectedDate, 
    !!isOpen && !!clientId && !!selectedDate,
    prioritizeCaptureDate
  );
  
  // Combine events from props and from the date query, removing duplicates
  // Use useMemo to prevent unnecessary re-renders
  const events = useMemo(() => {
    if (!propEvents && !dateEvents) return [];
    
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
  
  // Form state management - passing a copy of the date to avoid reference problems
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
    selectedDate: selectedDate ? new Date(selectedDate) : new Date(),
    selectedEvent,
    prioritizeCaptureDate,
    isOpen  // Pass isOpen parameter to the hook
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

  // Helper function to prepare form data for API - using proper type casting
  const prepareDataForAPI = (data: ContentScheduleFormData) => {
    // We'll only convert Date objects to strings in the mutation service,
    // so we just return the data here
    return data;
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
    // Prepare data but keep Date objects
    const preparedData = prepareDataForAPI(formData);
    await submitEvent(e, currentSelectedEvent, preparedData);
  };
  
  const handleStatusUpdate = async (e: React.FormEvent) => {
    // Prepare data but keep Date objects
    const preparedData = prepareDataForAPI(formData);
    await updateStatus(e, currentSelectedEvent, preparedData);
  };
  
  const handleDelete = async () => {
    await deleteEvent(currentSelectedEvent);
  };

  // Enhanced reset form function to ensure complete reset
  const enhancedResetForm = () => {
    console.log("Enhanced reset form called in ScheduleEventDialog");
    setCurrentSelectedEventNull(); // Reset the currentSelectedEvent state
    resetForm(); // Call the original resetForm from the hook
  };

  // Helper function to clear selected event
  const setCurrentSelectedEventNull = () => {
    console.log("Explicitly setting currentSelectedEvent to null");
    handleSelectEvent(null as unknown as CalendarEvent); // Force null as selected event
  };

  // Dialog title
  const dialogTitle = currentSelectedEvent ? "Editar Agendamento" : "Novo Agendamento";

  // Determine which tab to show by default
  const effectiveDefaultTab = selectedEvent ? "status" : "details";

  return (
    <DialogContainer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      selectedDate={selectedDate}
      onClose={onClose}
      title={dialogTitle}
      aria-describedby="schedule-dialog-description"
    >
      <div id="schedule-dialog-description" className="sr-only">
        Formulário de criação ou edição de agendamento de conteúdo.
      </div>
      
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
        onResetForm={enhancedResetForm}
        onSubmit={handleSubmit}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
        onCancel={onClose}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onDateChange={handleDateChange}
        onDateTimeChange={handleDateTimeChange}
        onAllDayChange={handleAllDayChange}
        defaultTab={effectiveDefaultTab}
        prioritizeCaptureDate={prioritizeCaptureDate}
      />
    </DialogContainer>
  );
}
