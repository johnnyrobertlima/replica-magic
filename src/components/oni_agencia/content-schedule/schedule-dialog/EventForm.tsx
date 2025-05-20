
import React, { useState } from "react";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClientSelect } from "./ClientSelect";
import { ServiceSelect } from "./ServiceSelect";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { DateTimePicker } from "./DateTimePicker";
import { EditorialLineSelect } from "./EditorialLineSelect";
import { ProductSelect } from "./ProductSelect";
import { StatusSelect } from "./StatusSelect";
import { Switch } from "@/components/ui/switch";
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
  services = [],
  collaborators = [],
  editorialLines = [],
  products = [],
  statuses = [],
  clients = [],
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
  const handleAllDayChange = (checked: boolean) => {
    onSelectChange("is_all_day", checked ? "true" : "false");
  };

  const handleCreatorsChange = (value: string[]) => {
    onSelectChange("creators", JSON.stringify(value));
  };

  const getCreatorsArray = () => {
    if (!formData.creators) return [];
    
    // Handle both string JSON and actual arrays
    if (typeof formData.creators === "string") {
      try {
        return JSON.parse(formData.creators);
      } catch (e) {
        console.error("Failed to parse creators string:", e);
        return [];
      }
    }
    
    return Array.isArray(formData.creators) ? formData.creators : [];
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              value={formData.title || ""}
              onChange={onInputChange}
              placeholder="Título do evento"
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
              placeholder="Descrição do evento"
            />
          </div>

          <ClientSelect
            clients={clients || []}
            value={formData.client_id}
            isLoading={isLoadingClients}
            onValueChange={(value) => onSelectChange("client_id", value)}
          />

          <ServiceSelect
            services={services || []}
            value={formData.service_id}
            isLoading={isLoadingServices}
            onValueChange={(value) => onSelectChange("service_id", value)}
          />

          <CollaboratorSelect
            collaborators={collaborators || []}
            value={formData.collaborator_id || "null"}
            isLoading={isLoadingCollaborators}
            onValueChange={(value) => onSelectChange("collaborator_id", value)}
          />

          <EditorialLineSelect
            editorialLines={editorialLines || []}
            value={formData.editorial_line_id || "null"}
            isLoading={isLoadingEditorialLines}
            onValueChange={(value) => onSelectChange("editorial_line_id", value)}
          />
        </div>

        <div className="space-y-4">
          <ProductSelect
            products={products || []}
            value={formData.product_id || "null"}
            isLoading={isLoadingProducts}
            onValueChange={(value) => onSelectChange("product_id", value)}
          />

          <StatusSelect
            statuses={statuses || []}
            value={formData.status_id || "null"}
            isLoading={isLoadingStatuses}
            onValueChange={(value) => onSelectChange("status_id", value)}
          />

          <DateTimePicker
            label="Data de Agendamento"
            date={formData.scheduled_date}
            onDateChange={(date) => onDateChange("scheduled_date", date)}
          />

          <DateTimePicker
            label="Data de Captura"
            date={formData.capture_date}
            onDateChange={(date) => onDateChange("capture_date", date)}
          />

          <div className="grid gap-2">
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={onInputChange}
              placeholder="Local do evento"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={formData.is_all_day === true}
              onCheckedChange={handleAllDayChange}
              id="is_all_day"
            />
            <Label htmlFor="is_all_day">Dia Inteiro</Label>
          </div>
          
          <CreatorsSelectMultiple
            collaborators={collaborators || []}
            value={getCreatorsArray()}
            isLoading={isLoadingCollaborators}
            onValueChange={handleCreatorsChange}
          />
        </div>
      </div>
    </div>
  );
}
