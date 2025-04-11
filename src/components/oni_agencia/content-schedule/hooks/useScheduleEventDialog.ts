
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { useCreateContentSchedule, useUpdateContentSchedule, useDeleteContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { useToast } from "@/hooks/use-toast";

export function useScheduleEventDialog({
  clientId,
  selectedDate,
  events,
  selectedEvent,
  onClose
}: {
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  selectedEvent?: CalendarEvent;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [currentSelectedEvent, setCurrentSelectedEvent] = useState<CalendarEvent | null>(selectedEvent || null);
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

  const createMutation = useCreateContentSchedule();
  const updateMutation = useUpdateContentSchedule();
  const deleteMutation = useDeleteContentSchedule();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Set the selectedEvent when it comes from props
  useEffect(() => {
    console.log("useScheduleEventDialog selectedEvent effect:", selectedEvent?.id);
    if (selectedEvent) {
      handleSelectEvent(selectedEvent);
    } else if (events.length === 1) {
      handleSelectEvent(events[0]);
    } else {
      resetForm();
    }
  }, [selectedEvent, events]);

  const resetForm = () => {
    console.log("resetting form in useScheduleEventDialog");
    setCurrentSelectedEvent(null);
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
    console.log("selecting event in useScheduleEventDialog:", event.id);
    setCurrentSelectedEvent(event);
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
    
    try {
      if (currentSelectedEvent) {
        console.log("Updating event:", currentSelectedEvent.id, formData);
        await updateMutation.mutateAsync({
          id: currentSelectedEvent.id,
          schedule: formData
        });
        toast({
          title: "Agendamento atualizado",
          description: "Agendamento atualizado com sucesso."
        });
      } else {
        console.log("Creating new event:", formData);
        await createMutation.mutateAsync(formData);
        toast({
          title: "Agendamento criado",
          description: "Novo agendamento criado com sucesso."
        });
      }
      
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o agendamento.",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentSelectedEvent) return;
    
    try {
      // Atualiza apenas o status e o colaborador
      const updateData = {
        status_id: formData.status_id,
        collaborator_id: formData.collaborator_id,
        description: formData.description
      };
      
      console.log("Updating event status:", currentSelectedEvent.id, updateData);
      await updateMutation.mutateAsync({
        id: currentSelectedEvent.id,
        schedule: updateData
      });
      
      toast({
        title: "Status atualizado",
        description: "Status do agendamento atualizado com sucesso."
        // Removed the variant: "success" that was causing the error
      });
      
      onClose();
    } catch (error) {
      console.error("Error in handleStatusUpdate:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!currentSelectedEvent) return;
    
    try {
      if (confirm("Tem certeza que deseja excluir este agendamento?")) {
        console.log("Deleting event:", currentSelectedEvent.id);
        await deleteMutation.mutateAsync({
          id: currentSelectedEvent.id,
          clientId,
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1
        });
        
        toast({
          title: "Agendamento excluído",
          description: "Agendamento excluído com sucesso."
        });
        
        onClose();
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o agendamento.",
        variant: "destructive"
      });
    }
  };

  return {
    currentSelectedEvent,
    formData,
    isSubmitting,
    isDeleting,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    handleStatusUpdate,
    handleDelete,
    handleSelectEvent,
    resetForm
  };
}
