
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { OniAgenciaCollaborator } from "@/types/oni-agencia";

interface CollaboratorSelectProps {
  collaborators: OniAgenciaCollaborator[];
  isLoading: boolean;
  value: string | null;
  onValueChange: (value: string) => void;
}

export function CollaboratorSelect({ 
  collaborators, 
  isLoading, 
  value, 
  onValueChange 
}: CollaboratorSelectProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="collaborator_id">Colaborador Responsável</Label>
      <Select
        value={value || ""}
        onValueChange={onValueChange}
      >
        <SelectTrigger id="collaborator_id" className="w-full">
          <SelectValue placeholder="Selecione um colaborador" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Carregando...</span>
            </div>
          ) : (
            collaborators.map((collaborator) => (
              <SelectItem key={collaborator.id} value={collaborator.id}>
                {collaborator.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
