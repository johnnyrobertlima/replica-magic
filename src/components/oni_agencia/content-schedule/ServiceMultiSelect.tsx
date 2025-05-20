
import React, { useEffect } from "react";
import { MultiSelect, Option } from "./MultiSelect";
import { useServices } from "@/hooks/useOniAgenciaContentSchedules";

interface ServiceMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

export function ServiceMultiSelect({
  value = [],
  onChange,
  className
}: ServiceMultiSelectProps) {
  const { data: services = [], isLoading } = useServices();
  
  // Ensure value is always a valid array
  const safeValue = Array.isArray(value) ? value : [];
  
  // Ensure services is always a valid array
  const safeServices = Array.isArray(services) ? services : [];
  
  // Initialize with all services selected when they load
  useEffect(() => {
    if (safeServices.length > 0 && safeValue.length === 0) {
      const validServiceIds = safeServices
        .filter(service => service && typeof service === 'object' && service.id)
        .map(service => service.id);
      
      if (validServiceIds.length > 0) {
        onChange(validServiceIds);
      }
    }
  }, [safeServices, safeValue.length, onChange]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 border rounded-md bg-white px-3">
        <span className="text-sm text-gray-500">Carregando serviços...</span>
      </div>
    );
  }

  // Create safe service options with thorough validation to prevent undefined values
  const serviceOptions: Option[] = safeServices
    .filter(service => service && typeof service === 'object' && service.id && service.name)
    .map(service => ({
      value: service.id,
      label: service.name
    }));
  
  // Return MultiSelect with validated data or a fallback if no valid options
  if (serviceOptions.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 border rounded-md bg-white px-3">
        <span className="text-sm text-gray-500">Nenhum serviço disponível</span>
      </div>
    );
  }
  
  return (
    <MultiSelect
      options={serviceOptions}
      value={safeValue}
      onChange={onChange}
      placeholder="Selecionar serviços"
      className={className}
    />
  );
}
