
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

export interface CollaboratorSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  collaborators: any[];
  isLoading: boolean;
}

export const CollaboratorSelect = ({ 
  value, 
  onValueChange, 
  collaborators, 
  isLoading 
}: CollaboratorSelectProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full bg-white">
        <SelectValue placeholder="Selecione o colaborador" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">Carregando...</span>
          </div>
        ) : (
          collaborators.map((collaborator) => (
            <SelectItem 
              key={collaborator.id} 
              value={collaborator.id}
            >
              {collaborator.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
