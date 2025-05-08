
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { CalendarEvent } from "@/types/oni-agencia";
import { 
  useServices,
  useCollaborators,
  useEditorialLines,
  useProducts,
  useStatuses
} from "@/hooks/useOniAgenciaContentSchedules";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { DialogContent as ScheduleDialogContent } from './schedule-dialog/DialogContent';
import { useScheduleEventDialog } from './hooks/useScheduleEventDialog';

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

export const ScheduleEventDialog: React.FC<ScheduleEventDialogProps> = ({
  isOpen,
  onOpenChange,
  clientId,
  selectedDate,
  events,
  onClose,
  selectedEvent,
  onManualRefetch
}) => {
  const {
    currentSelectedEvent,
    formData,
    isSubmitting,
    isDeleting,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleDateTimeChange,
    handleAllDayChange,
    handleSubmit: submitForm,
    handleStatusUpdate: updateStatus,
    handleDelete: deleteEvent,
    handleSelectEvent,
    resetForm
  } = useScheduleEventDialog({
    clientId,
    selectedDate,
    events,
    selectedEvent,
    onClose: () => {
      onOpenChange(false);
      onClose();
    },
    onManualRefetch
  });

  // Fetching necessary data
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  const { data: editorialLines = [], isLoading: isLoadingEditorialLines } = useEditorialLines();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: statuses = [], isLoading: isLoadingStatuses } = useStatuses();
  const { data: clients = [], isLoading: isLoadingClients } = useClients();

  // Wrapper functions to handle type compatibility issues
  const handleSubmitWrapper = (e: React.FormEvent) => submitForm(e);
  const handleStatusUpdateWrapper = (e: React.FormEvent) => updateStatus(e);
  const handleDeleteWrapper = () => deleteEvent();
  
  // Create wrapper functions for the problematic handlers
  const handleInputChangeWrapper = (field: string, value: string) => handleInputChange(field, value);
  const handleAllDayChangeWrapper = (field: string, value: boolean) => handleAllDayChange(field, value);

  const formattedDate = format(selectedDate, 'dd MMMM yyyy', { locale: ptBR });
  const dialogTitle = currentSelectedEvent ? "Editar Agendamento" : `Novo Agendamento - ${formattedDate}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        
        <ScheduleDialogContent
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
          onSubmit={handleSubmitWrapper}
          onStatusUpdate={handleStatusUpdateWrapper}
          onDelete={handleDeleteWrapper}
          onCancel={() => {
            onOpenChange(false);
            onClose();
          }}
          onInputChange={handleInputChangeWrapper}
          onSelectChange={handleSelectChange}
          onDateChange={handleDateChange}
          onDateTimeChange={handleDateTimeChange}
          onAllDayChange={handleAllDayChangeWrapper}
        />
      </DialogContent>
    </Dialog>
  );
};
