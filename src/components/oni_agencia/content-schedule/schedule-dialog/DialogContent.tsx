import { CalendarEvent, OniAgenciaService, OniAgenciaCollaborator, ContentScheduleFormData, OniAgenciaClient } from "@/types/oni-agencia";
import { EventList } from "./EventList";
import { NewEventForm } from "./NewEventForm";
import { EventEditor } from "./EventEditor";

interface DialogContentProps {
  selectedEvent?: CalendarEvent;
  events: CalendarEvent[];
  currentSelectedEvent: CalendarEvent | null;
  clientId: string;
  selectedDate: Date;
  services: OniAgenciaService[];
  collaborators: OniAgenciaCollaborator[];
  editorialLines: any[];
  products: any[];
  statuses: any[];
  clients: OniAgenciaClient[];
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
  onDateTimeChange?: (name: string, value: Date | null) => void;
  onAllDayChange?: (value: boolean) => void;
  defaultTab?: "details" | "status" | "history" | "capture";
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
  onDateTimeChange,
  onAllDayChange,
  defaultTab
}: DialogContentProps) {
  // Check if there are other events for this date
  const hasOtherEvents = events && events.length > 0;
  
  // Return different content based on whether we're editing or creating
  return (
    <>
      {currentSelectedEvent ? (
        <EventEditor 
          event={currentSelectedEvent}
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
          onDateTimeChange={onDateTimeChange}
          onAllDayChange={onAllDayChange}
          defaultActiveTab={defaultTab}
        />
      ) : (
        <>
          {hasOtherEvents && (
            <EventList 
              events={events} 
              onSelectEvent={onSelectEvent}
              clientId={clientId}
            />
          )}
          <NewEventForm 
            formData={formData}
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
            onCancel={onCancel}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onDateChange={onDateChange}
          />
        </>
      )}
    </>
  );
}
