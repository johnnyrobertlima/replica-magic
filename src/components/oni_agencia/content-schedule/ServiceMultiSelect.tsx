
import { useState, useEffect } from "react";
import { useServices } from "@/hooks/useOniAgenciaContentSchedules";
import { MultiSelect } from "./MultiSelect";

interface ServiceMultiSelectProps {
  value: string[];
  onChange: (serviceIds: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function ServiceMultiSelect({ 
  value = [], // Set default to empty array
  onChange, 
  placeholder = "Selecionar serviços...",
  className
}: ServiceMultiSelectProps) {
  const { data: services = [], isLoading } = useServices();
  const [options, setOptions] = useState<{value: string, label: string}[]>([]);
  
  useEffect(() => {
    if (services && Array.isArray(services) && services.length > 0) {
      setOptions(
        services.map((service) => ({
          value: service.id,
          label: service.name
        }))
      );
    } else {
      // Ensure options is always an array even if services data isn't available
      setOptions([]);
    }
  }, [services]);
  
  // Ensure we always pass arrays to MultiSelect
  const safeValue = Array.isArray(value) ? value : [];
  
  return (
    <MultiSelect 
      options={options}
      value={safeValue}
      onChange={onChange}
      placeholder={placeholder}
      isLoading={isLoading}
      className={className}
    />
  );
}
