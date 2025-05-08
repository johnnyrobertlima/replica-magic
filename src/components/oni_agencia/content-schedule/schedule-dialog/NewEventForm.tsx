
import { ContentScheduleFormData, OniAgenciaService, OniAgenciaCollaborator, OniAgenciaClient } from "@/types/oni-agencia";
import { DialogFooter } from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { DialogActions } from "./DialogActions";
import { EditorialLine, Product, Status } from "@/pages/admin/sub-themes/types";

interface NewEventFormProps {
  formData: ContentScheduleFormData;
  services: OniAgenciaService[];
  collaborators: OniAgenciaCollaborator[];
  editorialLines: EditorialLine[];
  products: Product[];
  statuses: Status[];
  clients: OniAgenciaClient[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  isLoadingClients: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: Date | null) => void;
}

export function NewEventForm({
  formData,
  services,
  collaborators,
  editorialLines,
  products,
  statuses,
  clients,
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts,
  isLoadingStatuses,
  isLoadingClients,
  isSubmitting,
  isDeleting,
  onSubmit,
  onCancel,
  onInputChange,
  onSelectChange,
  onDateChange
}: NewEventFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <EventForm
        formData={formData}
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
        onInputChange={onInputChange}
        onSelectChange={onSelectChange}
        onDateChange={onDateChange}
      />
      <DialogFooter>
        <DialogActions
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onCancel={onCancel}
          isEditing={false}
        />
      </DialogFooter>
    </form>
  );
}
