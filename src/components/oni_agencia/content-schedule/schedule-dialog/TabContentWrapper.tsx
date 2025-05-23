
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { EventForm } from "./EventForm";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { HistoryTimeline } from "./HistoryTimeline";
import { CaptureForm } from "./CaptureForm";
import { Button } from "@/components/ui/button";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";

interface TabContentWrapperProps {
  activeTab: string;
  currentSelectedEvent: CalendarEvent | null;
  formData: ContentScheduleFormData;
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
  historyData: any;
  isLoadingHistory: boolean;
  isHistoryError: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: Date | null) => void;
  onAllDayChange: (value: boolean) => void;
  onRefetchResources: () => void;
}

export function TabContentWrapper({
  activeTab,
  currentSelectedEvent,
  formData,
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
  historyData,
  isLoadingHistory,
  isHistoryError,
  onSubmit,
  onCancel,
  onInputChange,
  onSelectChange,
  onDateChange,
  onAllDayChange,
  onRefetchResources
}: TabContentWrapperProps) {
  const renderActionButtons = (showDelete = true) => (
    <div className="flex justify-end space-x-2 mt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Atualizando..." : (currentSelectedEvent ? "Atualizar" : "Criar")}
      </Button>
      {currentSelectedEvent && showDelete && (
        <Button 
          type="button" 
          variant="destructive" 
          onClick={() => {/* Delete logic handled by parent */}}
          disabled={isDeleting}
        >
          Excluir
        </Button>
      )}
    </div>
  );

  return (
    <ScrollArea className="h-[60vh]">
      <TabsContent value="details">
        <EventForm 
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
          onInputChange={onInputChange}
          onSelectChange={onSelectChange}
          onDateChange={onDateChange}
        />
        {renderActionButtons()}
      </TabsContent>
      
      <TabsContent value="status">
        <StatusUpdateForm 
          statuses={statuses}
          collaborators={collaborators}
          value={formData.status_id || ''}
          collaboratorId={formData.collaborator_id}
          description={formData.description || ''}
          isLoading={isLoadingStatuses}
          isLoadingCollaborators={isLoadingCollaborators}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onValueChange={(value) => onSelectChange('status_id', value)}
          onCollaboratorChange={(value) => onSelectChange('collaborator_id', value)}
          onInputChange={onInputChange}
          onCancel={onCancel}
        />
      </TabsContent>
      
      <TabsContent value="history">
        <div className="h-[60vh]">
          <HistoryTimeline 
            historyData={historyData} 
            isLoading={isLoadingHistory} 
            isError={isHistoryError}
            onRefetchResources={onRefetchResources}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="capture">
        <CaptureForm
          captureDate={formData.capture_date}
          captureEndDate={formData.capture_end_date}
          isAllDay={formData.is_all_day === true}
          location={formData.location}
          onDateChange={onDateChange}
          onLocationChange={onInputChange}
          onAllDayChange={onAllDayChange || (() => {})}
        />
        {renderActionButtons()}
      </TabsContent>
    </ScrollArea>
  );
}
