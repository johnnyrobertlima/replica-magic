
import React from "react";
import { SelectService } from "./SelectService";
import { SelectCollaborator } from "./SelectCollaborator";
import { SelectEditorialLine } from "./SelectEditorialLine";
import { SelectProduct } from "./SelectProduct";
import { SelectCreators } from "./SelectCreators";
import { DetailsForm } from "./DetailsForm";
import { useLocation } from "react-router-dom";

interface EventFormProps {
  formData: any;
  services: any[];
  collaborators: any[];
  editorialLines: any[];
  products: any[];
  statuses?: any[];
  clients?: any[];
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  isLoadingStatuses?: boolean;
  isLoadingClients?: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: Date | null) => void;
  prioritizeCaptureDate?: boolean;
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
  onDateChange,
  prioritizeCaptureDate = false
}: EventFormProps) {
  const location = useLocation();
  const isCapturesRoute = location.pathname.includes('/capturas');
  
  // Determine which fields are required based on route
  const isProductRequired = !isCapturesRoute;
  
  return (
    <div className="space-y-6">
      <DetailsForm
        clientId={formData.client_id}
        selectedDate={formData.scheduled_date || new Date()}
        services={services}
        editorialLines={editorialLines}
        products={products}
        clients={clients || []}
        isLoadingServices={isLoadingServices}
        isLoadingEditorialLines={isLoadingEditorialLines}
        isLoadingProducts={isLoadingProducts}
        isLoadingClients={isLoadingClients || false}
        formData={formData}
        onInputChange={onInputChange}
        onSelectChange={onSelectChange}
        onDateChange={onDateChange}
        prioritizeCaptureDate={prioritizeCaptureDate}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectService
          services={services}
          value={formData.service_id || ""}
          isLoading={isLoadingServices}
          onChange={(value) => onSelectChange("service_id", value)}
        />
        
        <SelectCollaborator
          collaborators={collaborators}
          value={formData.collaborator_id || "null"}
          isLoading={isLoadingCollaborators}
          onChange={(value) => onSelectChange("collaborator_id", value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectEditorialLine
          editorialLines={editorialLines}
          value={formData.editorial_line_id || "null"}
          isLoading={isLoadingEditorialLines}
          onChange={(value) => onSelectChange("editorial_line_id", value)}
        />
        
        <SelectProduct
          products={products}
          value={formData.product_id || "null"}
          isLoading={isLoadingProducts}
          onChange={(value) => onSelectChange("product_id", value)}
          required={isProductRequired}
        />
      </div>

      <SelectCreators
        collaborators={collaborators}
        value={formData.creators || []}
        isLoading={isLoadingCollaborators}
        onChange={(value) => onSelectChange("creators", value)}
        label="Participantes"
      />
    </div>
  );
}
