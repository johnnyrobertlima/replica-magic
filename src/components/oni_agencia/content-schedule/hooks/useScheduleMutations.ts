import { useState } from "react";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { useCreateContentSchedule, useUpdateContentSchedule, useDeleteContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { useToast } from "@/hooks/use-toast";

export function useScheduleMutations({
  onClose,
  clientId,
  selectedDate
}: {
  onClose: () => void;
  clientId: string;
  selectedDate: Date;
}) {
  const { toast } = useToast();
  
  const createMutation = useCreateContentSchedule();
  const updateMutation = useUpdateContentSchedule();
  const deleteMutation = useDeleteContentSchedule();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // Helper function to sanitize data before sending to API
  const sanitizeFormData = (data: ContentScheduleFormData): ContentScheduleFormData => {
    const sanitized = { ...data };
    
    // If title is null or an empty string, set it to a default value
    if (sanitized.title === null || sanitized.title === "") {
      sanitized.title = " "; // Use a space to satisfy non-null constraint
    }
    
    // Ensure client_id is always set
    if (!sanitized.client_id) {
      sanitized.client_id = clientId;
    }
    
    // Ensure scheduled_date is always set
    if (!sanitized.scheduled_date) {
      sanitized.scheduled_date = selectedDate.toISOString().split('T')[0];
    }
    
    // Remove empty string values for UUID fields - they should be null instead
    if (sanitized.status_id === "") sanitized.status_id = null;
    if (sanitized.editorial_line_id === "") sanitized.editorial_line_id = null;
    if (sanitized.product_id === "") sanitized.product_id = null;
    if (sanitized.collaborator_id === "") sanitized.collaborator_id = null;
    
    return sanitized;
  };

  const handleSubmit = async (
    e: React.FormEvent, 
    currentSelectedEvent: CalendarEvent | null,
    formData: ContentScheduleFormData
  ) => {
    e.preventDefault();
    
    try {
      const sanitizedData = sanitizeFormData(formData);

      // Log sanitized data for debugging
      console.log("Sanitized form data:", sanitizedData);
      
      if (currentSelectedEvent) {
        // If we're updating an existing event
        console.log("Updating event:", currentSelectedEvent.id, sanitizedData);
        
        // Special handling for service_id to prevent null values
        if (!sanitizedData.service_id) {
          // If service_id is null or empty but we're updating, don't include it
          // the service will keep its existing value in the database
          const { service_id, ...updateDataWithoutService } = sanitizedData;
          
          console.log("Updating without changing service_id:", updateDataWithoutService);
          await updateMutation.mutateAsync({
            id: currentSelectedEvent.id,
            schedule: updateDataWithoutService
          });
        } else {
          // Normal update with service_id included
          await updateMutation.mutateAsync({
            id: currentSelectedEvent.id,
            schedule: sanitizedData
          });
        }
        
        toast({
          title: "Agendamento atualizado",
          description: "Agendamento atualizado com sucesso."
        });
      } else {
        // For new events, service_id is required
        if (!sanitizedData.service_id) {
          toast({
            title: "Erro",
            description: "Selecione um serviço para criar o agendamento.",
            variant: "destructive"
          });
          return;
        }
        
        console.log("Creating new event:", sanitizedData);
        await createMutation.mutateAsync(sanitizedData);
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

  const handleStatusUpdate = async (
    e: React.FormEvent,
    currentSelectedEvent: CalendarEvent | null,
    formData: ContentScheduleFormData
  ) => {
    e.preventDefault();
    
    if (!currentSelectedEvent) return;
    
    try {
      // Atualiza apenas o status, o colaborador e a descrição
      const updateData = {
        status_id: formData.status_id === "" ? null : formData.status_id,
        collaborator_id: formData.collaborator_id === "" ? null : formData.collaborator_id,
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

  const handleDelete = async (currentSelectedEvent: CalendarEvent | null) => {
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
    isSubmitting,
    isDeleting,
    handleSubmit,
    handleStatusUpdate,
    handleDelete
  };
}
