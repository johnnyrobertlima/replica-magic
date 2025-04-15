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

  // Helper function to ensure title is handled correctly
  const sanitizeFormData = (data: ContentScheduleFormData): ContentScheduleFormData => {
    const sanitized = { ...data };
    
    // If title is an empty string, set it to null
    if (sanitized.title === "") {
      sanitized.title = null;
    }
    
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
      
      if (currentSelectedEvent) {
        console.log("Updating event:", currentSelectedEvent.id, sanitizedData);
        await updateMutation.mutateAsync({
          id: currentSelectedEvent.id,
          schedule: sanitizedData
        });
        toast({
          title: "Agendamento atualizado",
          description: "Agendamento atualizado com sucesso."
        });
      } else {
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
