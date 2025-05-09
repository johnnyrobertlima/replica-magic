
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { SelectService } from "./SelectService";
import { SelectCollaborator } from "./SelectCollaborator";
import { SelectEditorialLine } from "./SelectEditorialLine";
import { SelectProduct } from "./SelectProduct";
import { SelectStatus } from "./SelectStatus";
import { SelectClient } from "./SelectClient";
import { CreatorsSelectMultiple } from "./CreatorsSelectMultiple";

interface EventFormProps {
  formData: ContentScheduleFormData;
  services: any[];
  collaborators: any[];
  editorialLines: any[];
  products: any[];
  statuses: any[];
  clients: any[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses: boolean;
  isLoadingClients: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: Date | null) => void;
}

export function EventForm({
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
  onInputChange,
  onSelectChange,
  onDateChange
}: EventFormProps) {
  // Prepare the scheduled date as a Date object for the calendar
  const scheduledDate = formData.scheduled_date 
    ? new Date(formData.scheduled_date) 
    : null;
  
  // Handle URL rendering and conversion in description
  const renderDescription = () => {
    if (!formData.description) return "";
    
    // Function to handle URLs was moved to a utility file
    return formData.description;
  };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ""}
            onChange={onInputChange}
            placeholder="Título do agendamento"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="scheduled_date">Data de Agendamento</Label>
          <CalendarDatePicker
            id="scheduled_date"
            date={scheduledDate}
            onSelect={(date) => onDateChange("scheduled_date", date)}
            locale={ptBR}
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <SelectService
          services={services}
          value={formData.service_id}
          isLoading={isLoadingServices}
          onChange={(value) => onSelectChange("service_id", value)}
        />
        
        <SelectCollaborator
          collaborators={collaborators}
          value={formData.collaborator_id || ""}
          isLoading={isLoadingCollaborators}
          onChange={(value) => onSelectChange("collaborator_id", value)}
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <SelectEditorialLine
          editorialLines={editorialLines}
          value={formData.editorial_line_id || ""}
          isLoading={isLoadingEditorialLines}
          onChange={(value) => onSelectChange("editorial_line_id", value)}
        />
        
        <SelectProduct
          products={products}
          value={formData.product_id || ""}
          isLoading={isLoadingProducts}
          onChange={(value) => onSelectChange("product_id", value)}
        />
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <SelectStatus
          statuses={statuses}
          value={formData.status_id || ""}
          isLoading={isLoadingStatuses}
          onChange={(value) => onSelectChange("status_id", value)}
        />
        
        <SelectClient
          clients={clients}
          value={formData.client_id}
          isLoading={isLoadingClients}
          onChange={(value) => onSelectChange("client_id", value)}
        />
      </div>
      
      <CreatorsSelectMultiple
        collaborators={collaborators}
        isLoading={isLoadingCollaborators}
        value={formData.creators || []}
        onValueChange={(value) => onSelectChange("creators", JSON.stringify(value))}
      />
      
      <div className="space-y-2">
        <Label htmlFor="execution_phase">Fase de Execução</Label>
        <Input
          id="execution_phase"
          name="execution_phase"
          value={formData.execution_phase || ""}
          onChange={onInputChange}
          placeholder="Fase de execução"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={onInputChange}
          placeholder="Descrição do agendamento"
          rows={5}
        />
      </div>
    </div>
  );
}
