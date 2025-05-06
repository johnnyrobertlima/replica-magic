
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
  value, 
  onChange, 
  placeholder = "Selecionar serviços...",
  className
}: ServiceMultiSelectProps) {
  const { data: services = [], isLoading } = useServices();
  const [options, setOptions] = useState<{value: string, label: string}[]>([]);
  
  useEffect(() => {
    if (services && services.length > 0) {
      setOptions(
        services.map((service) => ({
          value: service.id,
          label: service.name
        }))
      );
    }
  }, [services]);
  
  return (
    <MultiSelect 
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      isLoading={isLoading}
      className={className}
    />
  );
}
