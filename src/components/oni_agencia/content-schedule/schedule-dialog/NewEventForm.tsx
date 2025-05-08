
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { ServiceSelect } from "./ServiceSelect";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { EditorialLineSelect } from "./EditorialLineSelect";
import { ProductSelect } from "./ProductSelect";
import { StatusSelect } from "./StatusSelect";
import { ExecutionPhaseSelect } from "./ExecutionPhaseSelect";
import { CreatorsMultiSelect } from "./CreatorsMultiSelect";
import { CaptureForm } from "./CaptureForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface NewEventFormProps {
  clientId: string;
  selectedDate: Date;
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
  formData: ContentScheduleFormData;
  isEditMode?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (field: keyof ContentScheduleFormData, value: string) => void;
  onDateChange: (field: keyof ContentScheduleFormData, value: string) => void;
  onDateTimeChange?: (field: string, value: Date | null) => void;
  onAllDayChange?: (checked: boolean) => void;
}

export function NewEventForm({
  clientId,
  selectedDate,
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
  formData,
  isEditMode = false,
  onSubmit,
  onCancel,
  onInputChange,
  onSelectChange,
  onDateChange,
  onDateTimeChange,
  onAllDayChange
}: NewEventFormProps) {
  const dateString = format(selectedDate, "yyyy-MM-dd");
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            placeholder="Título do agendamento"
            value={formData.title || ""}
            onChange={onInputChange}
          />
        </div>
        
        <ServiceSelect
          value={formData.service_id}
          onChange={(value) => onSelectChange("service_id", value)}
          services={services}
          isLoading={isLoadingServices}
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Descrição do agendamento"
          value={formData.description || ""}
          onChange={onInputChange}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollaboratorSelect
          value={formData.collaborator_id || ""}
          onChange={(value) => onSelectChange("collaborator_id", value)}
          collaborators={collaborators}
          isLoading={isLoadingCollaborators}
        />
        
        <StatusSelect
          value={formData.status_id || ""}
          onChange={(value) => onSelectChange("status_id", value)}
          statuses={statuses}
          isLoading={isLoadingStatuses}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditorialLineSelect
          value={formData.editorial_line_id || ""}
          onChange={(value) => onSelectChange("editorial_line_id", value)}
          editorialLines={editorialLines}
          isLoading={isLoadingEditorialLines}
        />
        
        <ProductSelect
          value={formData.product_id || ""}
          onChange={(value) => onSelectChange("product_id", value)}
          products={products}
          isLoading={isLoadingProducts}
        />
      </div>

      <ExecutionPhaseSelect
        value={formData.execution_phase || ""}
        onChange={(value) => onSelectChange("execution_phase", value)}
      />

      <CaptureForm
        captureDate={formData.capture_date ? new Date(formData.capture_date) : null}
        captureEndDate={formData.capture_end_date ? new Date(formData.capture_end_date) : null}
        location={formData.location || ""}
        isAllDay={formData.is_all_day || false}
        onDateChange={onDateTimeChange}
        onLocationChange={(e) => onInputChange(e)}
        onAllDayChange={onAllDayChange}
      />

      <CreatorsMultiSelect
        selectedCreators={formData.creators || []}
        onChange={(creators) => onSelectChange("creators", creators as unknown as string)}
        collaborators={collaborators}
        isLoading={isLoadingCollaborators}
      />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : isEditMode ? "Atualizar" : "Criar"}
        </Button>
      </div>
    </div>
  );
}
