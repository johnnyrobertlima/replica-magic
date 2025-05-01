
import { useState } from "react";
import { format } from "date-fns";
import { CalendarEvent, ContentScheduleFormData, OniAgenciaClient } from "@/types/oni-agencia";
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventForm } from "./EventForm";
import { DialogActions } from "./DialogActions";
import { StatusUpdateForm } from "./StatusUpdateForm";
import { ScheduleHistory } from "./ScheduleHistory";
import { ArrowDown, History } from "lucide-react";
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
  onDateChange
}: EventEditorProps) {
  const [activeTab, setActiveTab] = useState<"details" | "status" | "history">("details");
  const [note, setNote] = useState<string>(formData.description || "");
  
  const handleNoteChange = (value: string) => {
    setNote(value);
    onSelectChange("description", value);
  };

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "details" | "status" | "history")}>
      <TabsList className="grid w-full grid-cols-3">
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
      </TabsList>
      
      <TabsContent value="details">
        <ScrollArea className="h-[60vh]">
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
      
      <TabsContent value="status">
        <ScrollArea className="h-[60vh]">
          <form onSubmit={onStatusUpdate}>
            <StatusUpdateForm
              event={event}
              statuses={statuses}
              collaborators={collaborators}
              isLoadingStatuses={isLoadingStatuses}
              isLoadingCollaborators={isLoadingCollaborators}
              selectedStatus={formData.status_id}
              selectedCollaborator={formData.collaborator_id}
              note={note}
              onStatusChange={(value) => onSelectChange("status_id", value)}
              onCollaboratorChange={(value) => onSelectChange("collaborator_id", value)}
              onNoteChange={handleNoteChange}
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
      
      <TabsContent value="history" className="space-y-4">
        <ScrollArea className="h-[60vh]">
          <ScheduleHistory event={event} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
