
import React from "react";
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
  // Show the event list if there are multiple events and no specific event was selected
  if (!selectedEvent && events.length > 1 && !currentSelectedEvent) {
    return (
      <EventList 
        events={events} 
        onSelectEvent={onSelectEvent}
        onCreateNew={onResetForm}
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

  // Show new event form if no event was selected or there's only one event
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
