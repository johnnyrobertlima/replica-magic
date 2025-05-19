
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
      onChange(safeServices.map(service => service.id));
    }
  }, [safeServices, safeValue.length, onChange]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 border rounded-md bg-white px-3">
        <span className="text-sm text-gray-500">Carregando serviços...</span>
      </div>
    );
  }
  
  const serviceOptions: Option[] = safeServices.filter(service => service && service.id).map(service => ({
    value: service.id,
    label: service.name
  }));
  
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
