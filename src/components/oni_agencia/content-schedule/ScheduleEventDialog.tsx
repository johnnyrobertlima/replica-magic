
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
import { useCallback } from "react";

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
  
  // Função para disparar atualização completa
  const forceRefresh = useCallback(() => {
    console.log("Forçando atualização a partir do diálogo");
    
    // Invalidar caches
    queryClient.invalidateQueries({ queryKey: ['content-schedules'] });
    queryClient.invalidateQueries({ queryKey: ['infinite-content-schedules'] });
    
    // Executar refetch manual se disponível
    if (onManualRefetch) {
      console.log("Executando atualização manual a partir do diálogo");
      onManualRefetch();
      
      // Chamadas adicionais para garantir sincronização
      setTimeout(() => onManualRefetch(), 200);
      setTimeout(() => onManualRefetch(), 500);
    }
  }, [queryClient, onManualRefetch]);
  
  // Função aprimorada para fechar o diálogo e forçar atualização
  const handleDialogClose = useCallback(() => {
    // Fechar diálogo
    onClose();
    
    // Forçar atualização após fechar
    forceRefresh();
  }, [onClose, forceRefresh]);
  
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
    onClose: handleDialogClose
  });

  // Wrapper para submit que garante atualização
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    try {
      // Executar o submit original
      await submitHandler(e, currentSelectedEvent, formData);
      
      // Forçar atualização após submit bem-sucedido
      console.log("Executando atualização manual após submit");
      forceRefresh();
      
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      throw error;
    }
  };

  // Wrapper para atualização de status que garante atualização
  const handleStatusUpdate = async (e: React.FormEvent): Promise<void> => {
    try {
      // Executar a atualização original
      await statusUpdateHandler(e, currentSelectedEvent, formData);
      
      // Forçar atualização após atualização bem-sucedida
      console.log("Executando atualização manual após status update");
      forceRefresh();
      
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      throw error;
    }
  };

  // Wrapper para exclusão que garante atualização
  const handleDelete = async (): Promise<void> => {
    try {
      // Executar a exclusão original
      await deleteHandler(currentSelectedEvent);
      
      // Forçar atualização após exclusão bem-sucedida
      console.log("Executando atualização manual após delete");
      forceRefresh();
      
      return Promise.resolve();
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      throw error;
    }
  };

  // Carregar dados necessários
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
          // Atualizar ao fechar via X
          forceRefresh();
        }
      }} 
      selectedDate={selectedDate} 
      onClose={handleDialogClose}
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
          handleDialogClose();
        }}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onDateChange={handleDateChange}
      />
    </DialogContainer>
  );
}
