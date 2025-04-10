
import { useState } from "react";
import { format } from "date-fns";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventForm } from "./EventForm";
import { DialogActions } from "./DialogActions";
import { StatusUpdateForm } from "./StatusUpdateForm";

interface EventEditorProps {
  event: CalendarEvent;
  clientId: string;
  selectedDate: Date;
  services: any[];
  collaborators: any[];
  editorialLines: any[];
  products: any[];
  statuses: any[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onStatusUpdate: (e: React.FormEvent) => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  formData: ContentScheduleFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
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
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts,
  isLoadingStatuses,
  isSubmitting,
  isDeleting,
  onSubmit,
  onStatusUpdate,
  onDelete,
  onCancel,
  formData,
  onInputChange,
  onSelectChange
}: EventEditorProps) {
  const [activeTab, setActiveTab] = useState<"details" | "status">("details");
  const [note, setNote] = useState<string>("");

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "details" | "status")}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Detalhes</TabsTrigger>
        <TabsTrigger value="status">Atualizar Status</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <form onSubmit={onSubmit}>
          <EventForm
            formData={formData}
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
            onInputChange={onInputChange}
            onSelectChange={onSelectChange}
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
      </TabsContent>
      <TabsContent value="status">
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
            onNoteChange={setNote}
          />
          
          <DialogFooter>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <DialogActions
                isSubmitting={isSubmitting}
                isDeleting={false}
                onCancel={onCancel}
                onDelete={undefined}
                isEditing={true}
                saveLabel="Atualizar Status"
              />
            </div>
          </DialogFooter>
        </form>
      </TabsContent>
    </Tabs>
  );
}
