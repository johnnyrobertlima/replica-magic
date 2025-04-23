
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceSelect } from "./ServiceSelect";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { EditorialLineSelect } from "./EditorialLineSelect";
import { ProductSelect } from "./ProductSelect";
import { StatusSelect } from "./StatusSelect";
import { CreatorsMultiSelect } from "./CreatorsMultiSelect";
import { ContentScheduleFormData, OniAgenciaService, OniAgenciaCollaborator } from "@/types/oni-agencia";
import { EditorialLine, Product, Status } from "@/pages/admin/sub-themes/types";

interface EventFormProps {
  formData: ContentScheduleFormData;
  services: OniAgenciaService[];
  collaborators: OniAgenciaCollaborator[];
  editorialLines: EditorialLine[];
  products: Product[];
  statuses: Status[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function EventForm({
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
  onInputChange,
  onSelectChange
}: EventFormProps) {
  // Ensure creators is always an array, with multiple safety checks
  const creatorsArray = Array.isArray(formData.creators) 
    ? formData.creators 
    : formData.creators 
      ? [formData.creators] 
      : [];
  
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          value={formData.title || ""}
          onChange={onInputChange}
          placeholder="Título do agendamento (opcional)"
          className="border-input"
        />
        <p className="text-xs text-muted-foreground">Título é opcional</p>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={onInputChange}
          rows={3}
          placeholder="Descrição detalhada do agendamento"
        />
      </div>
      
      <ServiceSelect
        services={services || []}
        isLoading={isLoadingServices}
        value={formData.service_id}
        onValueChange={(value) => onSelectChange("service_id", value)}
      />
      
      <CollaboratorSelect
        collaborators={collaborators || []}
        isLoading={isLoadingCollaborators}
        value={formData.collaborator_id}
        onValueChange={(value) => onSelectChange("collaborator_id", value)}
      />
      
      <CreatorsMultiSelect
        collaborators={collaborators || []}
        isLoading={isLoadingCollaborators}
        value={creatorsArray}
        onValueChange={(values) => {
          // Ensure we're passing a valid array before converting to JSON
          if (Array.isArray(values)) {
            onSelectChange("creators", JSON.stringify(values));
          } else {
            console.error("Invalid creators value:", values);
            onSelectChange("creators", JSON.stringify([]));
          }
        }}
      />
      
      <EditorialLineSelect
        editorialLines={editorialLines || []}
        isLoading={isLoadingEditorialLines}
        value={formData.editorial_line_id}
        onValueChange={(value) => onSelectChange("editorial_line_id", value)}
      />
      
      <ProductSelect
        products={products || []}
        isLoading={isLoadingProducts}
        value={formData.product_id}
        onValueChange={(value) => onSelectChange("product_id", value)}
      />
      
      <StatusSelect
        statuses={statuses || []}
        isLoading={isLoadingStatuses}
        value={formData.status_id}
        onValueChange={(value) => onSelectChange("status_id", value)}
      />
    </div>
  );
}
