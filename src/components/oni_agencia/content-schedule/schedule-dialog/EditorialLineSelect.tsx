
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

export interface EditorialLineSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  editorialLines: any[];
  isLoading: boolean;
}

export const EditorialLineSelect = ({ 
  value, 
  onValueChange, 
  editorialLines, 
  isLoading 
}: EditorialLineSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder="Selecione a linha editorial" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          editorialLines.map((line) => (
            <SelectItem 
              key={line.id} 
              value={line.id}
              style={{ color: line.color || 'inherit' }}
            >
              {line.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
