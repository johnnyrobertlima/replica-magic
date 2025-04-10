
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  useServices,
  useCollaborators,
  useEditorialLines,
  useProducts,
  useStatuses,
  useCreateContentSchedule,
  useUpdateContentSchedule,
  useDeleteContentSchedule
} from "@/hooks/useOniAgenciaContentSchedules";
import { EventList } from "./schedule-dialog/EventList";
import { EventForm } from "./schedule-dialog/EventForm";
import { DialogActions } from "./schedule-dialog/DialogActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusUpdateForm } from "./schedule-dialog/StatusUpdateForm";

interface ScheduleEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  onClose: () => void;
}

export function ScheduleEventDialog({
  isOpen,
  onOpenChange,
  clientId,
  selectedDate,
  events,
  onClose
}: ScheduleEventDialogProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "status">("details");
  const [note, setNote] = useState<string>("");
  const [formData, setFormData] = useState<ContentScheduleFormData>({
    client_id: clientId,
    service_id: "",
    collaborator_id: null,
    title: "",
    description: null,
    scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
    execution_phase: null,
    editorial_line_id: null,
    product_id: null,
    status_id: null
  });

  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  const { data: editorialLines = [], isLoading: isLoadingEditorialLines } = useEditorialLines();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: statuses = [], isLoading: isLoadingStatuses } = useStatuses();
  
  const createMutation = useCreateContentSchedule();
  const updateMutation = useUpdateContentSchedule();
  const deleteMutation = useDeleteContentSchedule();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Se houver apenas um evento no dia, seleciona-o automaticamente
  useEffect(() => {
    if (events.length === 1) {
      handleSelectEvent(events[0]);
    } else {
      resetForm();
    }
  }, [events]);

  const resetForm = () => {
    setSelectedEvent(null);
    setActiveTab("details");
    setNote("");
    setFormData({
      client_id: clientId,
      service_id: "",
      collaborator_id: null,
      title: "",
      description: null,
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
      execution_phase: null,
      editorial_line_id: null,
      product_id: null,
      status_id: null
    });
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setFormData({
      client_id: event.client_id,
      service_id: event.service_id,
      collaborator_id: event.collaborator_id,
      title: event.title,
      description: event.description,
      scheduled_date: event.scheduled_date,
      execution_phase: event.execution_phase,
      editorial_line_id: event.editorial_line_id,
      product_id: event.product_id,
      status_id: event.status_id
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value === "null" ? null : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEvent) {
      await updateMutation.mutateAsync({
        id: selectedEvent.id,
        schedule: formData
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    
    onOpenChange(false);
    onClose();
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent) return;
    
    // Atualiza apenas o status e o colaborador
    const updateData = {
      status_id: formData.status_id,
      collaborator_id: formData.collaborator_id,
      description: note ? `${selectedEvent.description || ''}\n\nAtualização (${new Date().toLocaleString()}):\n${note}` : selectedEvent.description
    };
    
    await updateMutation.mutateAsync({
      id: selectedEvent.id,
      schedule: updateData
    });
    
    onOpenChange(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
      await deleteMutation.mutateAsync({
        id: selectedEvent.id,
        clientId,
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth() + 1
      });
      
      onOpenChange(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) onClose();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedEvent ? "Editar Agendamento" : "Novo Agendamento"}
            <div className="text-sm font-normal text-muted-foreground mt-1">
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
          </DialogTitle>
        </DialogHeader>

        <EventList 
          events={events} 
          onSelectEvent={(event) => {
            handleSelectEvent(event);
            setActiveTab("details");
          }}
          onCreateNew={resetForm}
        />

        {selectedEvent ? (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "details" | "status")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="status">Atualizar Status</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <form onSubmit={handleSubmit}>
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
                  onInputChange={handleInputChange}
                  onSelectChange={handleSelectChange}
                />
                
                <DialogFooter>
                  <DialogActions
                    isSubmitting={isSubmitting}
                    isDeleting={isDeleting}
                    onCancel={() => {
                      onOpenChange(false);
                      onClose();
                    }}
                    onDelete={handleDelete}
                    isEditing={true}
                  />
                </DialogFooter>
              </form>
            </TabsContent>
            <TabsContent value="status">
              <form onSubmit={handleStatusUpdate}>
                <StatusUpdateForm
                  event={selectedEvent}
                  statuses={statuses}
                  collaborators={collaborators}
                  isLoadingStatuses={isLoadingStatuses}
                  isLoadingCollaborators={isLoadingCollaborators}
                  selectedStatus={formData.status_id}
                  selectedCollaborator={formData.collaborator_id}
                  note={note}
                  onStatusChange={(value) => handleSelectChange("status_id", value)}
                  onCollaboratorChange={(value) => handleSelectChange("collaborator_id", value)}
                  onNoteChange={setNote}
                />
                
                <DialogFooter>
                  <div className="flex items-center justify-end space-x-2 pt-2">
                    <DialogActions
                      isSubmitting={isSubmitting}
                      isDeleting={false}
                      onCancel={() => {
                        onOpenChange(false);
                        onClose();
                      }}
                      onDelete={undefined}
                      isEditing={true}
                      saveLabel="Atualizar Status"
                    />
                  </div>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit}>
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
              onInputChange={handleInputChange}
              onSelectChange={handleSelectChange}
            />
            
            <DialogFooter>
              <DialogActions
                isSubmitting={isSubmitting}
                isDeleting={isDeleting}
                onCancel={() => {
                  onOpenChange(false);
                  onClose();
                }}
                onDelete={undefined}
                isEditing={false}
              />
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
