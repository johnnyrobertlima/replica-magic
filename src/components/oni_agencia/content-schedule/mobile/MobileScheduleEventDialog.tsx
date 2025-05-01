
import { useEffect } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { 
  useServices,
  useCollaborators,
  useEditorialLines,
  useProducts,
  useStatuses
} from "@/hooks/useOniAgenciaContentSchedules";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { MobileDialogContainer } from "./MobileDialogContainer";
import { DialogContent } from "../schedule-dialog/DialogContent";
import { useScheduleEventDialog } from "./hooks/useMobileScheduleEventDialog";

interface MobileScheduleEventDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  selectedDate: Date;
  events: CalendarEvent[];
  onClose: () => void;
  selectedEvent?: CalendarEvent;
  initialStatusTabActive?: boolean;
}

export function MobileScheduleEventDialog({
  isOpen,
  onOpenChange,
  clientId,
  selectedDate,
  events,
  onClose,
  selectedEvent,
  initialStatusTabActive = true
}: MobileScheduleEventDialogProps) {
  const {
    currentSelectedEvent,
    formData,
    activeTab,
    isSubmitting,
    isDeleting,
    setActiveTab,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    handleStatusUpdate,
    handleDelete,
    handleSelectEvent,
    resetForm
  } = useScheduleEventDialog({
    clientId,
    selectedDate,
    events,
    selectedEvent,
    initialTabActive: initialStatusTabActive ? "status" : "details",
    onClose: () => {
      onOpenChange(false);
      onClose();
    }
  });

  // Set active tab when initialStatusTabActive changes
  useEffect(() => {
    if (initialStatusTabActive) {
      setActiveTab("status");
    }
  }, [initialStatusTabActive, setActiveTab]);

  const { data: services = [], isLoading: isLoadingServices } = useServices();
  const { data: collaborators = [], isLoading: isLoadingCollaborators } = useCollaborators();
  const { data: editorialLines = [], isLoading: isLoadingEditorialLines } = useEditorialLines();
  const { data: products = [], isLoading: isLoadingProducts } = useProducts();
  const { data: statuses = [], isLoading: isLoadingStatuses } = useStatuses();
  const { data: clients = [], isLoading: isLoadingClients } = useClients();

  const dialogTitle = currentSelectedEvent ? "Editar Agendamento" : "Novo Agendamento";

  return (
    <MobileDialogContainer 
      isOpen={isOpen} 
      onOpenChange={onOpenChange} 
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
        }}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onDateChange={handleDateChange}
        defaultTab={activeTab}
      />
    </MobileDialogContainer>
  );
}
