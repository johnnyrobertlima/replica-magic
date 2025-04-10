
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceSelect } from "./ServiceSelect";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { ExecutionPhaseSelect } from "./ExecutionPhaseSelect";
import { ContentScheduleFormData, OniAgenciaService, OniAgenciaCollaborator } from "@/types/oni-agencia";

interface EventFormProps {
  formData: ContentScheduleFormData;
  services: OniAgenciaService[];
  collaborators: OniAgenciaCollaborator[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function EventForm({
  formData,
  services,
  collaborators,
  isLoadingServices,
  isLoadingCollaborators,
  onInputChange,
  onSelectChange
}: EventFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={onInputChange}
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={onInputChange}
          rows={3}
        />
      </div>
      
      <ServiceSelect
        services={services}
        isLoading={isLoadingServices}
        value={formData.service_id}
        onValueChange={(value) => onSelectChange("service_id", value)}
      />
      
      <CollaboratorSelect
        collaborators={collaborators}
        isLoading={isLoadingCollaborators}
        value={formData.collaborator_id}
        onValueChange={(value) => onSelectChange("collaborator_id", value)}
      />
      
      <ExecutionPhaseSelect
        value={formData.execution_phase}
        onValueChange={(value) => onSelectChange("execution_phase", value)}
      />
    </div>
  );
}
