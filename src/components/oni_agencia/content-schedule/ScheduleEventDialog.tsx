
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
import { useCallback, useRef } from "react";

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
  const lastRefetchTimeRef = useRef<number>(0);
  
  // Função aprimorada para forçar atualização
  const forceRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefetchTimeRef.current < 500) {
      console.log("Ignorando refetch muito próximo do anterior");
      return;
    }
    
    lastRefetchTimeRef.current = now;
    console.log("Forçando atualização a partir do diálogo");
    
    // Invalidar caches
    queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
    queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    
    // Executar refetch manual se disponível com múltiplos delays
    if (onManualRefetch) {
      console.log("Executando atualização manual a partir do diálogo");
      onManualRefetch();
      setTimeout(() => onManualRefetch(), 200);
      setTimeout(() => onManualRefetch(), 500);
      setTimeout(() => onManualRefetch(), 1000);
    }
  }, [queryClient, onManualRefetch]);
  
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
    onManualRefetch: forceRefresh,
    onClose: () => {
      onOpenChange(false);
      onClose();
      forceRefresh();
    }
  });

  // Wrapper functions para garantir que os argumentos corretos sejam passados e retornem Promise<void>
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    try {
      // Executar o submit
      await submitHandler(e, currentSelectedEvent, formData);
      
      // Após o submit bem sucedido, forçar atualização imediata
      console.log("Executando atualização manual após submit");
      forceRefresh();
      
      return Promise.resolve();
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
      console.log("Executando atualização manual após status update");
      forceRefresh();
      
      return Promise.resolve();
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
      console.log("Executando atualização manual após delete");
      forceRefresh();
      
      return Promise.resolve();
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
        if (!open) {
          // Executar atualização manual quando o diálogo for fechado através do botão X
          console.log("Executando atualização manual ao fechar diálogo pelo X");
          forceRefresh();
        }
      }} 
      selectedDate={selectedDate} 
      onClose={() => {
        onClose();
        forceRefresh();
      }}
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
          console.log("Executando atualização manual ao cancelar diálogo");
          forceRefresh();
        }}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onDateChange={handleDateChange}
      />
    </DialogContainer>
  );
}
