
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
  label?: string;
  errorMessage?: string;
}

export function CollaboratorSelect({ 
  collaborators = [], 
  isLoading, 
  value, 
  onValueChange,
  label = "Colaborador Responsável",
  errorMessage
}: CollaboratorSelectProps) {
  // Ensure collaborators is an array
  const safeCollaborators = Array.isArray(collaborators) ? collaborators : [];
  
  // Validate collection items to prevent rendering errors
  const validCollaborators = safeCollaborators.filter(
    c => c && typeof c === 'object' && c.id && typeof c.id === 'string' && c.name
  );
  
  // Handle case when collaborators fail to load but we're not in loading state anymore
  const hasError = !isLoading && validCollaborators.length === 0;

  return (
    <div className="grid gap-2">
      <Label htmlFor="collaborator_id">{label}</Label>
      <Select
        value={value || "null"}
        onValueChange={onValueChange}
        disabled={isLoading || hasError}
      >
        <SelectTrigger 
          id="collaborator_id" 
          className={`w-full ${hasError ? 'border-red-300' : ''}`}
        >
          <SelectValue placeholder={
            hasError 
              ? (errorMessage || "Erro ao carregar colaboradores") 
              : "Selecione um colaborador"
          } />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null">Nenhum</SelectItem>
          {isLoading ? (
            <div className="flex items-center justify-center p-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2">Carregando...</span>
            </div>
          ) : validCollaborators.length === 0 ? (
            <div className="p-2 text-sm text-red-500">
              Não foi possível carregar os colaboradores
            </div>
          ) : (
            validCollaborators.map((collaborator) => (
              <SelectItem key={collaborator.id} value={collaborator.id}>
                {collaborator.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {errorMessage && hasError && (
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
