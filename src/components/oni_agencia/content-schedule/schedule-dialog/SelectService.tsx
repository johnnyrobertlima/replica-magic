
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface SelectServiceProps {
  services: any[];
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function SelectService({ 
  services, 
  value, 
  isLoading, 
  onChange 
}: SelectServiceProps) {
  const getServiceColor = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.color : "#9b87f5";
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="service_id">Serviço</Label>
      <Select
        value={value}
        onValueChange={onChange}
        required
      >
        <SelectTrigger 
          id="service_id"
          className="w-full"
          style={value ? { borderLeftColor: getServiceColor(value), borderLeftWidth: '4px' } : {}}
        >
          <SelectValue placeholder="Selecione um serviço" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Carregando...</span>
            </div>
          ) : (
            services.map((service) => (
              <SelectItem 
                key={service.id} 
                value={service.id}
                className="flex items-center"
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: service.color }}
                  ></div>
                  {service.name}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
