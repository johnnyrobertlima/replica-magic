
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

export interface StatusSelectProps {
  value: string;
  onValueChange: (statusId: string) => void;
  statuses: any[];
  isLoading: boolean;
}

export const StatusSelect = ({ 
  value, 
  onValueChange, 
  statuses, 
  isLoading 
}: StatusSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder="Selecione o status" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          statuses.map((status) => (
            <SelectItem 
              key={status.id} 
              value={status.id}
              style={{ color: status.color || 'inherit' }}
            >
              {status.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
