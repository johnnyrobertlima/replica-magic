
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { NewEventForm } from "./NewEventForm";
import { EventSelector } from "./EventSelector";
import { EventEditor } from "./EventEditor";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  onDateTimeChange?: (name: string, value: Date | null) => void;
  onAllDayChange?: (value: boolean) => void;
  defaultTab?: "details" | "status" | "history" | "capture";
  prioritizeCaptureDate?: boolean;
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
  defaultTab = "details",
  prioritizeCaptureDate = false
}: DialogContentProps) {
  // Se há múltiplos eventos no mesmo dia, mostra seletor
  const showEventSelector = events.length > 0 && !currentSelectedEvent;

  return (
    <>
      {showEventSelector ? (
        <EventSelector
          events={events}
          onSelectEvent={onSelectEvent}
          onCreateNew={onResetForm}
        />
      ) : currentSelectedEvent ? (
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
          defaultTab={defaultTab}
        />
      ) : (
        <ScrollArea className="max-h-[80vh]">
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
            onDateTimeChange={onDateTimeChange}
            onAllDayChange={onAllDayChange}
            defaultTab={defaultTab}
          />
        </ScrollArea>
      )}
    </>
  );
}
