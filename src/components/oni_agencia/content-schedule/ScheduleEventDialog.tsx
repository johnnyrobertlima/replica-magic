
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
  useCreateContentSchedule,
  useUpdateContentSchedule,
  useDeleteContentSchedule
} from "@/hooks/useOniAgenciaContentSchedules";
import { EventList } from "./schedule-dialog/EventList";
import { EventForm } from "./schedule-dialog/EventForm";
import { DialogActions } from "./schedule-dialog/DialogActions";

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
    execution_phase: null
  });

  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  
  const createMutation = useCreateContentSchedule();
  const updateMutation = useUpdateContentSchedule();
  const deleteMutation = useDeleteContentSchedule();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // If there's just one event on this day, auto-select it for editing
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
      execution_phase: null
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
      execution_phase: event.execution_phase
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value || null }));
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
          onSelectEvent={handleSelectEvent}
          onCreateNew={resetForm}
        />

        <form onSubmit={handleSubmit}>
          <EventForm
            formData={formData}
            services={services}
            collaborators={collaborators}
            isLoadingServices={isLoadingServices}
            isLoadingCollaborators={isLoadingCollaborators}
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
              isEditing={!!selectedEvent}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
