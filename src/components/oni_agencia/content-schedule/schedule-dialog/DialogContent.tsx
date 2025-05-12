
import { ContentScheduleFormData, CalendarEvent } from "@/types/oni-agencia";
import { EventEditor } from "./EventEditor";
import { EventSelector } from "./EventSelector";
import { NewEventForm } from "./NewEventForm";
import { DetailsForm } from "./DetailsForm";

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
  defaultTab,
  prioritizeCaptureDate = false
}: DialogContentProps) {
  // Se há eventos para este dia e nenhum evento selecionado, mostrar seletor de eventos
  const hasEvents = events && events.length > 0;
  
  // Mostrar o seletor quando há eventos e nenhum evento está selecionado
  const showSelector = hasEvents && !currentSelectedEvent;
  
  if (showSelector) {
    return (
      <>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            Selecione um agendamento existente ou crie um novo
          </h3>
        </div>
        <EventSelector
          events={events}
          onSelectEvent={onSelectEvent}
          onCreateNew={() => {
            console.log("Forcing reset of form from DialogContent - onCreateNew called");
            // Force reset the form and clear any previously selected event
            onResetForm();
          }}
        />
      </>
    );
  }
  
  if (!currentSelectedEvent) {
    return (
      <div className="p-6">
        {prioritizeCaptureDate ? (
          <DetailsForm 
            clientId={clientId} 
            selectedDate={selectedDate}
            services={services}
            editorialLines={editorialLines}
            products={products}
            clients={clients}
            isLoadingServices={isLoadingServices}
            isLoadingEditorialLines={isLoadingEditorialLines}
            isLoadingProducts={isLoadingProducts}
            isLoadingClients={isLoadingClients}
            formData={formData}
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
            onDateChange={onDateChange}
            prioritizeCaptureDate={prioritizeCaptureDate}
          />
        ) : (
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
        )}
      </div>
    );
  }
  
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
    );
  }
  
  return null;
}
