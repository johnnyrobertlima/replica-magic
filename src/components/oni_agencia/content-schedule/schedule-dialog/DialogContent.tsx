
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarEvent } from "@/types/oni-agencia";
import { NewEventForm } from "./NewEventForm";
import { EventForm } from "./EventForm";
import { DialogActions } from "./DialogActions";
import { EventList } from "./EventList";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { ScheduleHistory } from "./ScheduleHistory";
import { CaptureForm } from "./CaptureForm";

interface DialogContentProps {
  events: CalendarEvent[];
  currentSelectedEvent: CalendarEvent | null;
  selectedEvent?: CalendarEvent;
  clientId: string;
  selectedDate: Date;
  formData: ContentScheduleFormData;
  isSubmitting: boolean;
  isDeleting: boolean;
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  isLoadingClients: boolean;
  services: any[];
  collaborators: any[];
  editorialLines: any[];
  products: any[];
  statuses: any[];
  clients: any[];
  onSelectEvent: (event: CalendarEvent) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: Date | null) => void;
  onDateTimeChange: (name: string, value: Date | null) => void;
  onAllDayChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStatusUpdate: (e: React.FormEvent) => void;
  onResetForm: () => void;
  onDelete: () => void;
  onCancel: () => void;
  defaultTab?: string;
}

export function DialogContent({
  events,
  currentSelectedEvent,
  selectedEvent,
  clientId,
  selectedDate,
  formData,
  isSubmitting,
  isDeleting,
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts,
  isLoadingStatuses,
  isLoadingClients,
  services,
  collaborators,
  editorialLines,
  products,
  statuses,
  clients,
  onSelectEvent,
  onInputChange,
  onSelectChange,
  onDateChange,
  onDateTimeChange,
  onAllDayChange,
  onSubmit,
  onStatusUpdate,
  onResetForm,
  onDelete,
  onCancel,
  defaultTab = "details"
}: DialogContentProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="max-h-[80vh] overflow-hidden flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">
                Detalhes
              </TabsTrigger>
              {currentSelectedEvent && (
                <>
                  <TabsTrigger value="status" className="flex-1">
                    Atualizar Status
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    Histórico
                  </TabsTrigger>
                  <TabsTrigger value="capture" className="flex-1">
                    Captura
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="details" className="mt-2">
              {currentSelectedEvent ? (
                <EventForm
                  formData={formData}
                  onInputChange={onInputChange}
                  onSelectChange={onSelectChange}
                  onDateChange={onDateChange}
                  services={services}
                  collaborators={collaborators}
                  editorialLines={editorialLines}
                  products={products}
                  isLoadingServices={isLoadingServices}
                  isLoadingCollaborators={isLoadingCollaborators}
                  isLoadingEditorialLines={isLoadingEditorialLines}
                  isLoadingProducts={isLoadingProducts}
                />
              ) : (
                <NewEventForm
                  formData={formData}
                  onInputChange={onInputChange}
                  onSelectChange={onSelectChange}
                  onDateChange={onDateChange}
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
                />
              )}
            </TabsContent>

            {currentSelectedEvent && (
              <>
                <TabsContent value="status" className="mt-2">
                  <StatusUpdateForm
                    formData={formData}
                    onSelectChange={onSelectChange}
                    statuses={statuses}
                    isLoadingStatuses={isLoadingStatuses}
                  />
                </TabsContent>
                <TabsContent value="history" className="mt-2">
                  <ScheduleHistory
                    eventId={currentSelectedEvent.id}
                  />
                </TabsContent>
                <TabsContent value="capture" className="mt-2">
                  <CaptureForm
                    formData={formData}
                    onDateTimeChange={onDateTimeChange}
                    onAllDayChange={onAllDayChange}
                    onInputChange={onInputChange}
                  />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>

        <div className="lg:col-span-1 border rounded-md">
          <div className="p-2">
            <h3 className="font-medium mb-2">Eventos do dia</h3>
            <EventList
              events={events}
              onSelectEvent={onSelectEvent}
            />
          </div>
        </div>
      </div>

      <DialogActions
        isEditMode={!!currentSelectedEvent}
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        onSubmit={activeTab === "status" ? onStatusUpdate : onSubmit}
        onDelete={onDelete}
        onCancel={onCancel}
        onNewEvent={onResetForm}
        activeTab={activeTab}
      />
    </div>
  );
}
