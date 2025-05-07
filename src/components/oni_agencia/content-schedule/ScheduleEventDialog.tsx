
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";
import { 
  useServices,
  useCollaborators,
  useEditorialLines,
  useProducts,
  useStatuses
} from "@/hooks/useOniAgenciaContentSchedules";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { DialogContainer } from "./schedule-dialog/DialogContainer";
import { DialogContent } from "./schedule-dialog/DialogContent";
import { useScheduleEventDialog } from "./hooks/useScheduleEventDialog";
import { useQueryClient } from "@tanstack/react-query";

interface ScheduleEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  onClose: () => void;
  selectedEvent?: CalendarEvent;
  onManualRefetch?: () => void;
}

export function ScheduleEventDialog({
  isOpen,
  onOpenChange,
  clientId,
  selectedDate,
  events,
  onClose,
  selectedEvent,
  onManualRefetch
}: ScheduleEventDialogProps) {
  const queryClient = useQueryClient();
  
  const {
    currentSelectedEvent,
    formData,
    isSubmitting,
    isDeleting,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit: submitHandler,
    handleStatusUpdate: statusUpdateHandler,
    handleDelete: deleteHandler,
    handleSelectEvent,
    resetForm
  } = useScheduleEventDialog({
    clientId,
    selectedDate,
    events,
    selectedEvent,
    onManualRefetch, // Pass the function for manual refresh
    onClose: () => {
      // Primeiro fecha o diálogo
      onOpenChange(false);
      onClose();
      
      // Depois força uma atualização imediata
      if (onManualRefetch) {
        console.log("Executando atualização manual ao fechar diálogo (componente principal)");
        
        // Primeiro invalidamos os caches
        queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
        queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
        
        // Depois chamamos a refetch manual várias vezes com delays diferentes
        onManualRefetch();
        setTimeout(() => {
          onManualRefetch();
        }, 100);
        setTimeout(() => {
          onManualRefetch();
        }, 300);
      }
    }
  });

  // Wrapper functions para garantir que os argumentos corretos sejam passados e retornem Promise<void>
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    try {
      // Executar o submit
      await submitHandler(e, currentSelectedEvent, formData);
      
      // Após o submit bem sucedido, forçar atualização imediata
      if (onManualRefetch) {
        console.log("Executando atualização manual após submit");
        onManualRefetch();
        setTimeout(() => {
          onManualRefetch();
        }, 200);
      }
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      throw error;
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent): Promise<void> => {
    try {
      // Executar a atualização de status
      await statusUpdateHandler(e, currentSelectedEvent, formData);
      
      // Após a atualização bem sucedida, forçar atualização imediata
      if (onManualRefetch) {
        console.log("Executando atualização manual após status update");
        onManualRefetch();
        setTimeout(() => {
          onManualRefetch();
        }, 200);
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      throw error;
    }
  };

  const handleDelete = async (): Promise<void> => {
    try {
      // Executar a exclusão
      await deleteHandler(currentSelectedEvent);
      
      // Após a exclusão bem sucedida, forçar atualização imediata
      if (onManualRefetch) {
        console.log("Executando atualização manual após delete");
        onManualRefetch();
        setTimeout(() => {
          onManualRefetch();
        }, 200);
      }
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      throw error;
    }
  };

  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  const { data: editorialLines = [], isLoading: isLoadingEditorialLines } = useEditorialLines();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: statuses = [], isLoading: isLoadingStatuses } = useStatuses();
  const { data: clients = [], isLoading: isLoadingClients } = useClients();

  const dialogTitle = currentSelectedEvent ? "Editar Agendamento" : "Novo Agendamento";

  return (
    <DialogContainer 
      isOpen={isOpen} 
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open && onManualRefetch) {
          // Executar atualização manual quando o diálogo for fechado através do botão X
          console.log("Executando atualização manual ao fechar diálogo pelo X");
          onManualRefetch();
          setTimeout(() => {
            onManualRefetch();
          }, 200);
        }
      }} 
      selectedDate={selectedDate} 
      onClose={onClose}
      title={dialogTitle}
    >
      <DialogContent
        selectedEvent={selectedEvent}
        events={events}
        currentSelectedEvent={currentSelectedEvent}
        clientId={clientId}
        selectedDate={selectedDate}
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
        isSubmitting={isSubmitting}
        isDeleting={isDeleting}
        formData={formData}
        onSelectEvent={handleSelectEvent}
        onResetForm={resetForm}
        onSubmit={handleSubmit}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
        onCancel={() => {
          onOpenChange(false);
          onClose();
          
          // Atualização manual ao cancelar
          if (onManualRefetch) {
            console.log("Executando atualização manual ao cancelar diálogo");
            onManualRefetch();
            setTimeout(() => {
              onManualRefetch();
            }, 200);
          }
        }}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onDateChange={handleDateChange}
      />
    </DialogContainer>
  );
}
