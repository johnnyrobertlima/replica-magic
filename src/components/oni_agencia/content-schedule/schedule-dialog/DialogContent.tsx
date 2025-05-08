
import { useState, useEffect } from "react";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewEventForm } from "./NewEventForm";
import { EventList } from "./EventList";
import { EventEditor } from "./EventEditor";

interface DialogContentProps {
  selectedEvent?: CalendarEvent;
  events: CalendarEvent[];
  currentSelectedEvent?: CalendarEvent | null;
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
  onSubmit: () => void;
  onStatusUpdate: (statusId: string) => void;
  onDelete: () => void;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (field: keyof ContentScheduleFormData, value: string) => void;
  onDateChange: (field: keyof ContentScheduleFormData, value: string) => void;
  onDateTimeChange?: (field: string, value: Date | null) => void;
  onAllDayChange?: (checked: boolean) => void;
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
  onAllDayChange
}: DialogContentProps) {
  const [activeTab, setActiveTab] = useState<"info" | "edit">("info");
  const isEditMode = !!currentSelectedEvent;

  useEffect(() => {
    if (currentSelectedEvent) {
      setActiveTab("info");
    } else {
      setActiveTab("edit");
    }
  }, [currentSelectedEvent]);

  // Event creation or update form
  if (!isEditMode) {
    return (
      <NewEventForm 
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
        formData={formData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onInputChange={onInputChange}
        onSelectChange={onSelectChange}
        onDateChange={onDateChange}
        onDateTimeChange={onDateTimeChange}
        onAllDayChange={onAllDayChange}
      />
    );
  }

  // Event viewing and editing
  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "info" | "edit")}>
      <TabsList className="mb-4">
        <TabsTrigger value="info">Informações</TabsTrigger>
        <TabsTrigger value="edit">Editar</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="space-y-6">
        {events.length > 0 && (
          <EventList 
            events={events} 
            selectedEvent={currentSelectedEvent} 
            onSelectEvent={onSelectEvent} 
          />
        )}

        {currentSelectedEvent && (
          <div className="pt-4">
            <EventEditor 
              event={currentSelectedEvent}
              statuses={statuses}
              isLoadingStatuses={isLoadingStatuses}
              onStatusUpdate={onStatusUpdate}
              onDelete={onDelete}
              isDeleting={isDeleting}
            />
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="edit">
        <NewEventForm 
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
          formData={formData}
          isEditMode={true}
          onSubmit={onSubmit}
          onCancel={onCancel}
          onInputChange={onInputChange}
          onSelectChange={onSelectChange}
          onDateChange={onDateChange}
          onDateTimeChange={onDateTimeChange}
          onAllDayChange={onAllDayChange}
        />
      </TabsContent>
    </Tabs>
  );
}
