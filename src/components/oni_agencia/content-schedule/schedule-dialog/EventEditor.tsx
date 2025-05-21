
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Pencil, Camera, History, FileText } from "lucide-react";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { EventForm } from "./EventForm";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { CaptureForm } from "./CaptureForm";
import { HistoryTimeline } from "./HistoryTimeline";
import { DialogActions } from "./DialogActions";
import { useScheduleHistory } from "../hooks/useScheduleHistory";
import { useLocation } from 'react-router-dom';

interface EventEditorProps {
  event: CalendarEvent;
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
  prioritizeCaptureDate?: boolean;
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
  defaultTab = "details",
  prioritizeCaptureDate = false
}: EventEditorProps) {
  const location = useLocation();
  const isCapturesRoute = location.pathname.includes('/capturas');
  const initialTab = isCapturesRoute ? "capture" : defaultTab;
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const { history, isLoadingHistory } = useScheduleHistory(event.id);
  
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };
  
  const handleStatusUpdateForm = (e: React.FormEvent) => {
    e.preventDefault();
    onStatusUpdate(e);
  };

  return (
    <form>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <FileText size={16} />
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Pencil size={16} />
            Status
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History size={16} />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="capture" className="flex items-center gap-2">
            <Camera size={16} />
            Captura
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <ScrollArea className="max-h-[60vh]">
            <EventForm
              formData={formData}
              services={services}
              collaborators={collaborators}
              editorialLines={editorialLines}
              products={products}
              isLoadingServices={isLoadingServices}
              isLoadingCollaborators={isLoadingCollaborators}
              isLoadingEditorialLines={isLoadingEditorialLines}
              isLoadingProducts={isLoadingProducts}
              onInputChange={onInputChange}
              onSelectChange={onSelectChange}
              onDateChange={onDateChange}
              prioritizeCaptureDate={prioritizeCaptureDate}
            />
          </ScrollArea>
          <DialogFooter className="mt-4">
            <DialogActions
              isSubmitting={isSubmitting}
              isDeleting={isDeleting}
              onCancel={onCancel}
              onDelete={onDelete}
              isEditing={true}
              saveLabel="Salvar"
            />
          </DialogFooter>
        </TabsContent>

        <TabsContent value="status">
          <StatusUpdateForm
            event={event}
            statuses={statuses}
            collaborators={collaborators}
            isLoadingStatuses={isLoadingStatuses}
            isLoadingCollaborators={isLoadingCollaborators}
            selectedStatus={formData.status_id || ""}
            selectedCollaborator={formData.collaborator_id || ""}
            note={formData.description || ""}
            onStatusChange={(value) => onSelectChange("status_id", value)}
            onCollaboratorChange={(value) => onSelectChange("collaborator_id", value)}
            onNoteChange={(value) => onInputChange({ target: { name: "description", value } } as React.ChangeEvent<HTMLTextAreaElement>)}
          />
          <DialogFooter className="mt-4">
            <DialogActions
              isSubmitting={isSubmitting}
              isDeleting={false}
              onCancel={onCancel}
              isEditing={true}
              submitLabel="Atualizar Status"
              showDelete={false}
            />
          </DialogFooter>
        </TabsContent>

        <TabsContent value="history">
          <ScrollArea className="max-h-[60vh]">
            <HistoryTimeline 
              history={history}
              isLoading={isLoadingHistory}
            />
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="capture">
          <ScrollArea className="max-h-[60vh]">
            <CaptureForm
              captureDate={formData.capture_date}
              captureEndDate={formData.capture_end_date}
              isAllDay={formData.is_all_day === true}
              location={formData.location}
              onDateChange={onDateChange}
              onLocationChange={onInputChange}
              onAllDayChange={onAllDayChange || (() => {})}
            />
          </ScrollArea>
          <DialogFooter className="mt-4">
            <DialogActions
              isSubmitting={isSubmitting}
              isDeleting={isDeleting}
              onCancel={onCancel}
              onDelete={onDelete}
              isEditing={true}
              saveLabel="Salvar"
            />
          </DialogFooter>
        </TabsContent>
      </Tabs>
    </form>
  );
}
