
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { DialogFooter } from "@/components/ui/dialog";
import { EventForm } from "./EventForm";
import { DialogActions } from "./DialogActions";

interface NewEventFormProps {
  formData: ContentScheduleFormData;
  services: any[];
  collaborators: any[];
  editorialLines: any[];
  products: any[];
  statuses: any[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function NewEventForm({
  formData,
  services,
  collaborators,
  editorialLines,
  products,
  statuses,
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts,
  isLoadingStatuses,
  isSubmitting,
  isDeleting,
  onSubmit,
  onCancel,
  onInputChange,
  onSelectChange
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
        isLoadingServices={isLoadingServices}
        isLoadingCollaborators={isLoadingCollaborators}
        isLoadingEditorialLines={isLoadingEditorialLines}
        isLoadingProducts={isLoadingProducts}
        isLoadingStatuses={isLoadingStatuses}
        onInputChange={onInputChange}
        onSelectChange={onSelectChange}
      />
      
      <DialogFooter>
        <DialogActions
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
          onCancel={onCancel}
          onDelete={undefined}
          isEditing={false}
        />
      </DialogFooter>
    </form>
  );
}
