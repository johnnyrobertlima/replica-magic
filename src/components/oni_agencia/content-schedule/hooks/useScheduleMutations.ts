
import { useState } from "react";
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { useCreateContentSchedule, useUpdateContentSchedule, useDeleteContentSchedule } from "@/hooks/useOniAgenciaContentSchedules";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useScheduleMutations({
  onClose,
  clientId,
  selectedDate,
  onManualRefetch
}: {
  onClose: () => void;
  clientId: string;
  selectedDate: Date;
  onManualRefetch?: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
        // If updating an existing event
        console.log("Updating event:", currentSelectedEvent.id, sanitizedData);
        
        // Special handling for service_id to prevent null values
        if (!sanitizedData.service_id) {
          // If service_id is null or empty but we're updating, don't include it
          // the service will keep its existing value in the database
          const { service_id, ...updateDataWithoutService } = sanitizedData;
          
          console.log("Updating without changing service_id:", updateDataWithoutService);
          await updateMutation.mutateAsync({
            id: currentSelectedEvent.id,
            data: {
              // Add the service_id back from the current event to make TypeScript happy
              service_id: currentSelectedEvent.service_id,
              ...updateDataWithoutService
            }
          });
        } else {
          // Normal update with service_id included
          await updateMutation.mutateAsync({
            id: currentSelectedEvent.id,
            data: sanitizedData
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
      
      // Execute manual refetch immediately if the function was provided
      if (onManualRefetch) {
        console.log("Executando atualização manual após salvar");
        onManualRefetch();
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
      // Create a complete update object with all required fields from the current event
      const updateData: ContentScheduleFormData = {
        client_id: currentSelectedEvent.client_id,
        service_id: currentSelectedEvent.service_id,
        title: currentSelectedEvent.title || "",
        scheduled_date: currentSelectedEvent.scheduled_date,
        // Only update these fields
        status_id: formData.status_id === "" ? null : formData.status_id,
        collaborator_id: formData.collaborator_id === "" ? null : formData.collaborator_id,
        description: formData.description,
        // Keep other fields
        execution_phase: currentSelectedEvent.execution_phase,
        editorial_line_id: currentSelectedEvent.editorial_line_id,
        product_id: currentSelectedEvent.product_id,
        creators: currentSelectedEvent.creators || []
      };
      
      console.log("Updating event status:", currentSelectedEvent.id, updateData);
      await updateMutation.mutateAsync({
        id: currentSelectedEvent.id,
        data: updateData
      });
      
      toast({
        title: "Status atualizado",
        description: "Status do agendamento atualizado com sucesso."
      });
      
      // Execute manual refetch immediately if the function was provided
      if (onManualRefetch) {
        console.log("Executando atualização manual após atualizar status");
        onManualRefetch();
      }
      
      onClose();
    } catch (error) {
      console.error("Error in handleStatusUpdate:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status.",
      });
    }
  };

  const handleDelete = async (currentSelectedEvent: CalendarEvent | null) => {
    if (!currentSelectedEvent) return;
    
    try {
      if (confirm("Tem certeza que deseja excluir este agendamento?")) {
        console.log("Deleting event:", currentSelectedEvent.id);
        await deleteMutation.mutateAsync(currentSelectedEvent.id);
        
        toast({
          title: "Agendamento excluído",
          description: "Agendamento excluído com sucesso."
        });
        
        // Execute manual refetch immediately if the function was provided
        if (onManualRefetch) {
          console.log("Executando atualização manual após excluir");
          onManualRefetch();
        }
        
        onClose();
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao excluir o agendamento.",
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
