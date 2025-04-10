
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
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
import { DialogContainer } from "./schedule-dialog/DialogContainer";
import { EventEditor } from "./schedule-dialog/EventEditor";
import { NewEventForm } from "./schedule-dialog/NewEventForm";

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
      description: formData.description
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

  const dialogTitle = selectedEvent ? "Editar Agendamento" : "Novo Agendamento";

  return (
    <DialogContainer 
      isOpen={isOpen} 
      onOpenChange={onOpenChange} 
      selectedDate={selectedDate} 
      onClose={onClose}
      title={dialogTitle}
    >
      <EventList 
        events={events} 
        onSelectEvent={(event) => {
          handleSelectEvent(event);
        }}
        onCreateNew={resetForm}
      />

      {selectedEvent ? (
        <EventEditor
          event={selectedEvent}
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
          isDeleting={isDeleting}
          onSubmit={handleSubmit}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
          onCancel={() => {
            onOpenChange(false);
            onClose();
          }}
          formData={formData}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
        />
      ) : (
        <NewEventForm
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
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onSubmit={handleSubmit}
          onCancel={() => {
            onOpenChange(false);
            onClose();
          }}
          onInputChange={handleInputChange}
          onSelectChange={handleSelectChange}
        />
      )}
    </DialogContainer>
  );
}
