
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
  const [isUserEditing, setIsUserEditing] = useState(false);
  
  // Log dialog state for debugging
  useEffect(() => {
    console.log(`ScheduleEventDialog - isOpen: ${isOpen}, clientId: ${clientId}, selectedDate: ${selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'undefined'}`);
    
    // Mark as initialized once component mounts
    if (!isInitialized) {
      setIsInitialized(true);
    }
    
    // When dialog opens, reset the editing state
    if (isOpen) {
      setIsUserEditing(false);
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
  // IMPORTANT: If the user is editing, don't fetch new data!
  const { events: dateEvents, isLoading: isLoadingEvents } = useEventsByDate(
    clientId, 
    selectedDate, 
    !!isOpen && !!clientId && !!selectedDate && !isUserEditing,
    prioritizeCaptureDate
  );
  
  // Combine events from props and from the date query, removing duplicates
  // Use useMemo to prevent unnecessary re-renders
  const events = useMemo(() => {
    // If user is actively editing, don't update the events list
    if (isUserEditing) {
      console.log("User is editing, not updating events list");
      return propEvents || [];
    }
    
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
  }, [propEvents, dateEvents, isUserEditing]);
  
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
  
  // Set the user as editing when any input changes
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
  
  // Wrap handlers to match expected function signatures
  const handleSubmit = async (e: React.FormEvent) => {
    // Prepare data but keep Date objects
    const preparedData = prepareDataForAPI(formData);
    await submitEvent(e, currentSelectedEvent, preparedData);
    setIsUserEditing(false);
  };
  
  const handleStatusUpdate = async (e: React.FormEvent) => {
    // Prepare data but keep Date objects
    const preparedData = prepareDataForAPI(formData);
    await updateStatus(e, currentSelectedEvent, preparedData);
    setIsUserEditing(false);
  };
  
  const handleDelete = async () => {
    await deleteEvent(currentSelectedEvent);
    setIsUserEditing(false);
  };

  // Enhanced reset form function to ensure complete reset
  const enhancedResetForm = () => {
    console.log("Enhanced reset form called in ScheduleEventDialog");
    setIsUserEditing(false);
    setCurrentSelectedEventNull(); // Reset the currentSelectedEvent state
    resetForm(); // Call the original resetForm from the hook
  };

  // Enhanced close function to ensure we prompt the user if they have unsaved changes
  const handleDialogClose = () => {
    if (isUserEditing && !isSubmitting && !isDeleting) {
      if (window.confirm("Você tem alterações não salvas. Deseja realmente fechar?")) {
        setIsUserEditing(false);
        onClose();
      }
    } else {
      onClose();
    }
  };
  
  // Enhanced open change function to check for unsaved changes
  const handleOpenChange = (open: boolean) => {
    if (!open && isUserEditing && !isSubmitting && !isDeleting) {
      if (window.confirm("Você tem alterações não salvas. Deseja realmente fechar?")) {
        setIsUserEditing(false);
        onOpenChange(open);
      }
    } else {
      onOpenChange(open);
    }
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
      onOpenChange={handleOpenChange}
      selectedDate={selectedDate}
      onClose={handleDialogClose}
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
        onCancel={handleDialogClose}
        onInputChange={handleAnyInputChange}
        onSelectChange={handleAnySelectChange}
        onDateChange={handleAnyDateChange}
        onDateTimeChange={handleAnyDateTimeChange}
        onAllDayChange={handleAnyAllDayChange}
        defaultTab={effectiveDefaultTab}
        prioritizeCaptureDate={prioritizeCaptureDate}
      />
    </DialogContainer>
  );
}
