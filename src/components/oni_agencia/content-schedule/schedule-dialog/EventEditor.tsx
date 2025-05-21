
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarEvent, ContentScheduleFormData, OniAgenciaClient } from "@/types/oni-agencia";
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventForm } from "./EventForm";
import { DialogActions } from "./DialogActions";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { ScheduleHistory } from "./ScheduleHistory";
import { CaptureForm } from "./CaptureForm";
import { ArrowDown, History, Camera } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventEditorProps {
  event: CalendarEvent;
  clientId: string;
  selectedDate: Date;
  services: any[];
  collaborators: any[];
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
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onStatusUpdate: (e: React.FormEvent) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  formData: ContentScheduleFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: Date | null) => void;
  onDateTimeChange?: (name: string, value: Date | null) => void;
  onAllDayChange?: (value: boolean) => void;
  defaultTab?: "details" | "status" | "history" | "capture";
}

export function EventEditor({
  event,
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
  onSubmit,
  onStatusUpdate,
  onDelete,
  onCancel,
  formData,
  onInputChange,
  onSelectChange,
  onDateChange,
  onDateTimeChange,
  onAllDayChange,
  defaultTab = "details"
}: EventEditorProps) {
  const [activeTab, setActiveTab] = useState<"details" | "status" | "history" | "capture">(defaultTab);
  const [note, setNote] = useState<string>(formData.description || "");
  
  // Update activeTab when defaultTab changes
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);
  
  const handleNoteChange = (value: string) => {
    setNote(value);
    onSelectChange("description", value);
  };

  // Determine the tab content height based on active tab
  const getContentHeight = () => {
    return activeTab === "history" ? "h-[60vh]" : "h-[60vh]";
  };

  // Handle date changes for the capture tab
  const handleCaptureDateTime = (name: string, value: Date | null) => {
    if (onDateTimeChange) {
      onDateTimeChange(name, value);
    } else {
      // Fallback to standard date handling if not provided
      onDateChange(name, value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "details" | "status" | "history" | "capture")} className="flex flex-col h-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="details">Detalhes</TabsTrigger>
        <TabsTrigger 
          value="status" 
          className={`relative ${activeTab === "status" ? "bg-purple-100 hover:bg-purple-200 text-purple-800" : ""}`}
        >
          {activeTab === "status" && (
            <ArrowDown className="h-4 w-4 absolute -top-3 left-1/2 transform -translate-x-1/2 text-purple-500" />
          )}
          Atualizar Status
        </TabsTrigger>
        <TabsTrigger 
          value="history"
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          Histórico
        </TabsTrigger>
        <TabsTrigger 
          value="capture"
          className="flex items-center gap-2"
        >
          <Camera className="h-4 w-4" />
          Captura
        </TabsTrigger>
      </TabsList>
      
      <div className="flex-grow">
        <TabsContent value="details" className="mt-2 h-full">
          <ScrollArea className={getContentHeight()}>
            <form onSubmit={onSubmit}>
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
              
              <DialogFooter>
                <DialogActions
                  isSubmitting={isSubmitting}
                  isDeleting={isDeleting}
                  onCancel={onCancel}
                  onDelete={onDelete}
                  isEditing={true}
                />
              </DialogFooter>
            </form>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="status" className="mt-2 h-full">
          <ScrollArea className={getContentHeight()}>
            <form onSubmit={onStatusUpdate}>
              <StatusUpdateForm
                statuses={statuses}
                value={formData.status_id || ''}
                description={formData.description || ''}
                isLoading={isLoadingStatuses}
                isSubmitting={isSubmitting}
                onSubmit={onStatusUpdate}
                onValueChange={(value) => onSelectChange("status_id", value)}
                onInputChange={onInputChange}
                onCancel={onCancel}
              />
              
              <DialogFooter>
                <DialogActions
                  isSubmitting={isSubmitting}
                  isDeleting={false}
                  onCancel={onCancel}
                  isEditing={true}
                  saveLabel="Atualizar Status"
                />
              </DialogFooter>
            </form>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="history" className="mt-2 h-full">
          <div className="h-[60vh]">
            <ScheduleHistory event={event} />
          </div>
        </TabsContent>
        
        <TabsContent value="capture" className="mt-2 h-full">
          <ScrollArea className={getContentHeight()}>
            <form onSubmit={onSubmit}>
              <CaptureForm
                clientId={clientId}
                captureDate={formData.capture_date}
                captureEndDate={formData.capture_end_date}
                isAllDay={formData.is_all_day === true}
                location={formData.location}
                collaboratorId={formData.collaborator_id || null}
                serviceId={formData.service_id || ""}
                description={formData.description || ""}
                linkedSchedules={formData.creators || []}
                onDateChange={onDateChange}
                onLocationChange={onInputChange}
                onDescriptionChange={onInputChange}
                onCollaboratorChange={(value) => onSelectChange("collaborator_id", value)}
                onServiceChange={(value) => onSelectChange("service_id", value)}
                onAllDayChange={onAllDayChange || (() => {})}
                onLinkedSchedulesChange={(scheduleIds) => onSelectChange("creators", scheduleIds.join(','))}
              />
              
              <DialogFooter>
                <DialogActions
                  isSubmitting={isSubmitting}
                  isDeleting={isDeleting}
                  onCancel={onCancel}
                  isEditing={true}
                  saveLabel="Salvar"
                />
              </DialogFooter>
            </form>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
}
