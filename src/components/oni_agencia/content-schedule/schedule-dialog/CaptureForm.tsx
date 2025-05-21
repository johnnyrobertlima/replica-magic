
import React, { useState } from "react";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClientSelect } from "./ClientSelect";
import { ServiceSelect } from "./ServiceSelect";
import { CollaboratorSelect } from "./CollaboratorSelect";
import { EditorialLineSelect } from "./EditorialLineSelect";
import { ProductSelect } from "./ProductSelect";
import { DateTimePicker } from "./DateTimePicker";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CreatorsSelectMultiple } from "./CreatorsSelectMultiple";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";

interface CaptureFormProps {
  formData: ContentScheduleFormData;
  clients: any[];
  services: any[];
  collaborators: any[];
  editorialLines: any[];
  products: any[];
  isLoadingClients: boolean;
  isLoadingServices: boolean;
  isLoadingCollaborators: boolean;
  isLoadingEditorialLines: boolean;
  isLoadingProducts: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onDateChange: (name: string, value: Date | null) => void;
  onDateTimeChange: (name: string, value: Date | null) => void;
  onAllDayChange: (value: boolean) => void;
  clientId: string;
  selectedDate: Date;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function CaptureForm({
  formData,
  clients,
  services,
  collaborators,
  editorialLines,
  products,
  isLoadingClients,
  isLoadingServices,
  isLoadingCollaborators,
  isLoadingEditorialLines,
  isLoadingProducts,
  onInputChange,
  onSelectChange,
  onDateChange,
  onDateTimeChange,
  onAllDayChange,
  clientId,
  selectedDate,
  isSubmitting,
  onCancel
}: CaptureFormProps) {
  const handleCreatorsChange = (value: string[]) => {
    onSelectChange("creators", JSON.stringify(value));
  };

  const getCreatorsArray = () => {
    if (!formData.creators) return [];

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
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Campos marcados com * são obrigatórios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ClientSelect 
            clients={clients} 
            value={formData.client_id} 
            isLoading={isLoadingClients} 
            onValueChange={value => onSelectChange("client_id", value)} 
            required
            label="Cliente*"
          />
        </div>

        <div>
          <Label htmlFor="title">Título*</Label>
          <Input
            id="title"
            name="title"
            value={formData.title || ""}
            onChange={onInputChange}
            placeholder="Título da captura"
            required
            className={!formData.title ? "border-red-300" : ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ServiceSelect 
            services={services} 
            isLoading={isLoadingServices} 
            value={formData.service_id} 
            onValueChange={value => onSelectChange("service_id", value)} 
            required
            label="Serviço*"
          />
        </div>

        <div>
          <Label htmlFor="location">Local</Label>
          <Input
            id="location"
            name="location"
            value={formData.location || ""}
            onChange={onInputChange}
            placeholder="Local da captura"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <CollaboratorSelect 
            collaborators={collaborators} 
            value={formData.collaborator_id || "null"} 
            isLoading={isLoadingCollaborators} 
            onValueChange={value => onSelectChange("collaborator_id", value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="is_all_day">Todo o dia</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_all_day"
              checked={formData.is_all_day === true}
              onCheckedChange={onAllDayChange}
            />
            <Label htmlFor="is_all_day" className="cursor-pointer">
              {formData.is_all_day ? "Sim" : "Não"}
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="capture_date" className="flex items-center">
            Data de Captura* 
            {!formData.capture_date && (
              <span className="text-red-500 ml-1 text-sm">Campo obrigatório</span>
            )}
          </Label>
          {formData.is_all_day ? (
            <CalendarDatePicker
              value={formData.capture_date}
              onChange={(date) => onDateChange("capture_date", date)}
              placeholder="Selecione uma data"
              className={!formData.capture_date ? "border-red-300" : ""}
            />
          ) : (
            <DateTimePicker 
              date={formData.capture_date}
              onDateChange={(date) => onDateTimeChange("capture_date", date)}
              showTimePicker={true}
              className={!formData.capture_date ? "border-red-300" : ""}
            />
          )}
        </div>

        {!formData.is_all_day && (
          <div>
            <Label htmlFor="capture_end_date">Data de Término</Label>
            <DateTimePicker 
              date={formData.capture_end_date}
              onDateChange={(date) => onDateTimeChange("capture_end_date", date)}
              showTimePicker={true}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="scheduled_date">Data de Agendamento (opcional)</Label>
          <CalendarDatePicker
            value={formData.scheduled_date}
            onChange={(date) => onDateChange("scheduled_date", date)}
            placeholder="Selecione uma data"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Nesta página, a data de captura é a principal. A data de agendamento é opcional.
          </p>
        </div>

        <CreatorsSelectMultiple 
          collaborators={collaborators || []} 
          value={getCreatorsArray()} 
          isLoading={isLoadingCollaborators} 
          onValueChange={handleCreatorsChange} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditorialLineSelect 
          editorialLines={editorialLines} 
          value={formData.editorial_line_id || "null"} 
          isLoading={isLoadingEditorialLines} 
          onValueChange={value => onSelectChange("editorial_line_id", value)} 
        />
        
        <div>
          <ProductSelect 
            products={products} 
            value={formData.product_id || "null"} 
            isLoading={isLoadingProducts} 
            onValueChange={value => onSelectChange("product_id", value)} 
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={onInputChange}
          placeholder="Descreva detalhes sobre a captura"
          rows={5}
          className="min-h-[120px]"
        />
      </div>
    </div>
  );
}
