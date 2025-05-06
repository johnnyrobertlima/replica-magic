
import React from "react";
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
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-10 border rounded-md bg-white px-3">
        <span className="text-sm text-gray-500">Loading services...</span>
      </div>
    );
  }
  
  const serviceOptions: Option[] = services.map(service => ({
    value: service.id,
    label: service.name
  }));
  
  return (
    <MultiSelect
      options={serviceOptions}
      value={value}
      onChange={onChange}
      placeholder="Select services"
      className={className}
    />
  );
}
