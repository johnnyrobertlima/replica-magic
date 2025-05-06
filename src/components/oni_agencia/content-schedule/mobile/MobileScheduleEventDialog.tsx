
import React, { useState } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useScheduleEventDialog } from "./hooks/useMobileScheduleEventDialog";
import { 
  useServices,
  useCollaborators,
  useEditorialLines,
  useProducts,
  useStatuses
} from "@/hooks/useOniAgenciaContentSchedules";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { MobileDialogContainer } from "./MobileDialogContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventForm } from "../schedule-dialog/EventForm";
import { StatusUpdateForm } from "../schedule-dialog/StatusUpdateForm";
import { ScheduleHistory } from "../schedule-dialog/ScheduleHistory";
import { DialogActions } from "../schedule-dialog/DialogActions";
import { History } from "lucide-react";

interface MobileScheduleEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  onClose: () => void;
  selectedEvent?: CalendarEvent;
  initialStatusTabActive?: boolean;
}

export function MobileScheduleEventDialog({
  isOpen,
  onOpenChange,
  clientId,
  selectedDate,
  events,
  onClose,
  selectedEvent,
  initialStatusTabActive = false
}: MobileScheduleEventDialogProps) {
  const defaultTab = initialStatusTabActive ? "status" : "details";
  
  const {
    currentSelectedEvent,
    formData,
    activeTab,
    setActiveTab,
    isSubmitting,
    isDeleting,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    handleStatusUpdate,
    handleDelete,
    handleSelectEvent,
    resetForm
  } = useScheduleEventDialog({
    clientId,
    selectedDate,
    events,
    selectedEvent,
    initialTabActive: defaultTab as "details" | "status" | "history",
    onClose: () => {
      onOpenChange(false);
      onClose();
    }
  });

  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  const { data: editorialLines = [], isLoading: isLoadingEditorialLines } = useEditorialLines();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: statuses = [], isLoading: isLoadingStatuses } = useStatuses();
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  
  const [description, setDescription] = useState(formData.description || "");
  
  const handleNoteChange = (value: string) => {
    setDescription(value);
    handleSelectChange("description", value);
  };

  // If no current event, show nothing
  if (!currentSelectedEvent) {
    return null;
  }

  return (
    <MobileDialogContainer
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      selectedDate={selectedDate}
      onClose={onClose}
      title={currentSelectedEvent?.id ? "Editar Agendamento" : "Novo Agendamento"}
    >
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "details" | "status" | "history")} className="flex flex-col h-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center justify-center gap-1">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="details" className="h-full flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4">
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
                  onInputChange={handleInputChange}
                  onSelectChange={handleSelectChange}
                  onDateChange={handleDateChange}
                />
              </div>
            </ScrollArea>
            
            <div className="border-t p-4">
              <DialogActions
                isSubmitting={isSubmitting}
                isDeleting={isDeleting}
                onCancel={onClose}
                onDelete={handleDelete}
                isEditing={!!currentSelectedEvent?.id}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="status" className="h-full flex flex-col">
            <ScrollArea className="flex-1">
              <div className="p-4">
                <StatusUpdateForm
                  event={currentSelectedEvent}
                  statuses={statuses}
                  collaborators={collaborators}
                  isLoadingStatuses={isLoadingStatuses}
                  isLoadingCollaborators={isLoadingCollaborators}
                  selectedStatus={formData.status_id}
                  selectedCollaborator={formData.collaborator_id}
                  note={description}
                  onStatusChange={(value) => handleSelectChange("status_id", value)}
                  onCollaboratorChange={(value) => handleSelectChange("collaborator_id", value)}
                  onNoteChange={handleNoteChange}
                />
              </div>
            </ScrollArea>
            
            <div className="border-t p-4">
              <DialogActions
                isSubmitting={isSubmitting}
                isDeleting={false}
                onCancel={onClose}
                isEditing={true}
                saveLabel="Atualizar Status"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="h-full flex flex-col">
            <ScheduleHistory event={currentSelectedEvent} />
          </TabsContent>
        </div>
      </Tabs>
    </MobileDialogContainer>
  );
}
