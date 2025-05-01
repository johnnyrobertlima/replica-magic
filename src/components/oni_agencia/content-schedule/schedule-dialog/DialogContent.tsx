
import { useState, useEffect } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { EventList } from "./EventList";
import { EventEditor } from "./EventEditor";
import { ContentScheduleFormData } from "@/types/oni-agencia";

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
  clients: any[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  isLoadingClients: boolean;
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
  onDateChange: (name: string, value: Date | null) => void;
  defaultTab?: "details" | "status" | "history";
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
  clients,
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts,
  isLoadingStatuses,
  isLoadingClients,
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
  onSelectChange,
  onDateChange,
  defaultTab
}: DialogContentProps) {
  const [showEventList, setShowEventList] = useState(!selectedEvent && events.length > 0);
  
  // Use defaultTab if provided
  useEffect(() => {
    if (currentSelectedEvent && defaultTab) {
      // The EventEditor component will handle setting this tab when rendering
      console.log("Setting default tab to:", defaultTab);
    }
  }, [currentSelectedEvent, defaultTab]);

  const resetAndShowList = () => {
    onResetForm();
    setShowEventList(events.length > 0);
  };
  
  const handleExplicitCreateNew = () => {
    onResetForm();
    setShowEventList(false);
  };

  if (showEventList) {
    return (
      <EventList 
        events={events}
        onSelectEvent={(event) => {
          onSelectEvent(event);
          setShowEventList(false);
        }}
        onCreateNew={handleExplicitCreateNew}
      />
    );
  }

  return (
    <EventEditor
      event={currentSelectedEvent!}
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
      onSubmit={onSubmit}
      onStatusUpdate={onStatusUpdate}
      onDelete={onDelete}
      onCancel={onCancel}
      formData={formData}
      onInputChange={onInputChange}
      onSelectChange={onSelectChange}
      onDateChange={onDateChange}
      defaultActiveTab={defaultTab}
    />
  );
}
