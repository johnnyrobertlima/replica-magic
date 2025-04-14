
import React, { useState, useEffect } from "react";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { EventList } from "./EventList";
import { EventEditor } from "./EventEditor";
import { NewEventForm } from "./NewEventForm";

interface DialogContentProps {
  selectedEvent?: CalendarEvent;
  events: CalendarEvent[];
  currentSelectedEvent: CalendarEvent | null;
  clientId: string;
  selectedDate: Date;
  services: any[];
  collaborators: any[];
  editorialLines: any[];
  products: any[];
  statuses: any[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  formData: ContentScheduleFormData;
  onSelectEvent: (event: CalendarEvent) => void;
  onResetForm: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onStatusUpdate: (e: React.FormEvent) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function DialogContent({
  selectedEvent,
  events,
  currentSelectedEvent,
  clientId,
  selectedDate,
  services,
  collaborators,
  editorialLines,
  products,
  statuses,
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts,
  isLoadingStatuses,
  isSubmitting,
  isDeleting,
  formData,
  onSelectEvent,
  onResetForm,
  onSubmit,
  onStatusUpdate,
  onDelete,
  onCancel,
  onInputChange,
  onSelectChange
}: DialogContentProps) {
  // Local state to track if we're in "create new" mode
  const [showNewForm, setShowNewForm] = useState(false);
  
  // Reset state when dialog opens with no selected event
  useEffect(() => {
    if (!selectedEvent && !currentSelectedEvent) {
      // If no event is selected, we should show the new form
      setShowNewForm(true);
    } else {
      setShowNewForm(false);
    }
  }, [selectedEvent, currentSelectedEvent]);
  
  // Handler for the "Criar Novo" button
  const handleCreateNew = () => {
    console.log("handleCreateNew called, resetting form and showing new form");
    onResetForm();
    setShowNewForm(true);
  };
  
  // Show the event list if there are multiple events and not in "create new" mode
  if (!selectedEvent && events.length > 1 && !currentSelectedEvent && !showNewForm) {
    return (
      <EventList 
        events={events} 
        onSelectEvent={onSelectEvent}
        onCreateNew={handleCreateNew}
      />
    );
  }

  // Show the event editor if an event was selected
  if (currentSelectedEvent) {
    return (
      <EventEditor
        event={currentSelectedEvent}
        clientId={clientId}
        selectedDate={selectedDate}
        services={services}
        collaborators={collaborators}
        editorialLines={editorialLines}
        products={products}
        statuses={statuses}
        isLoadingServices={isLoadingServices}
        isLoadingCollaborators={isLoadingCollaborators}
        isLoadingEditorialLines={isLoadingEditorialLines}
        isLoadingProducts={isLoadingProducts}
        isLoadingStatuses={isLoadingStatuses}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        onSubmit={onSubmit}
        onStatusUpdate={onStatusUpdate}
        onDelete={onDelete}
        onCancel={onCancel}
        formData={formData}
        onInputChange={onInputChange}
        onSelectChange={onSelectChange}
      />
    );
  }

  // Show new event form if in "create new" mode or if no event was selected
  return (
    <NewEventForm
      formData={formData}
      services={services}
      collaborators={collaborators}
      editorialLines={editorialLines}
      products={products}
      statuses={statuses}
      isLoadingServices={isLoadingServices}
      isLoadingCollaborators={isLoadingCollaborators}
      isLoadingEditorialLines={isLoadingEditorialLines}
      isLoadingProducts={isLoadingProducts}
      isLoadingStatuses={isLoadingStatuses}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onInputChange={onInputChange}
      onSelectChange={onSelectChange}
    />
  );
}
