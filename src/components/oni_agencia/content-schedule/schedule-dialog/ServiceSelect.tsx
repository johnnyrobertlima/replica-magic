
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

export interface ServiceSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  services: any[];
  isLoading: boolean;
}

export const ServiceSelect = ({ 
  value, 
  onValueChange, 
  services, 
  isLoading 
}: ServiceSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder="Selecione o serviço" />
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
              style={{ color: service.color || 'inherit' }}
            >
              {service.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
