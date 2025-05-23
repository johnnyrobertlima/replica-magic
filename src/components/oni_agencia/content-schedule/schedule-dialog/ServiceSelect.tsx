
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { OniAgenciaService } from "@/types/oni-agencia";

interface ServiceSelectProps {
  services: OniAgenciaService[];
  isLoading: boolean;
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  label?: string;
}

export function ServiceSelect({ 
  services, 
  isLoading, 
  value, 
  onValueChange,
  required = false,
  label = "Serviço"
}: ServiceSelectProps) {
  const getServiceColor = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.color : "#9b87f5";
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="service_id" className="flex items-center">
        {label}
        {required && !value && (
          <span className="text-red-500 ml-1 text-sm">Campo obrigatório</span>
        )}
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        required={required}
      >
        <SelectTrigger 
          id="service_id"
          className={`w-full ${required && !value ? "border-red-300" : ""}`}
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
