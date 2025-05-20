
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
import { useState, useEffect } from "react";

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
  // Local state to ensure stable rendering
  const [safeCollaborators, setSafeCollaborators] = useState<OniAgenciaCollaborator[]>([]);
  const [safeValue, setSafeValue] = useState<string>("null");
  
  // Update safe collaborators when the prop changes
  useEffect(() => {
    if (Array.isArray(collaborators)) {
      // Filter out invalid collaborators
      const valid = collaborators.filter(c => 
        c && typeof c === 'object' && c.id && c.name
      );
      setSafeCollaborators(valid);
    } else {
      setSafeCollaborators([]);
    }
  }, [collaborators]);
  
  // Update safe value when the prop changes
  useEffect(() => {
    setSafeValue(value || "null");
  }, [value]);
  
  // Handle selection change with validation
  const handleChange = (newValue: string) => {
    // Ensure we always have a valid selection
    if (typeof newValue === 'string') {
      onValueChange(newValue);
    } else {
      onValueChange("null");
    }
  };
  
  // Error state
  const hasError = !isLoading && safeCollaborators.length === 0;

  return (
    <div className="grid gap-2">
      <Label htmlFor="collaborator_id">{label}</Label>
      <Select
        value={safeValue}
        onValueChange={handleChange}
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
          ) : safeCollaborators.length === 0 ? (
            <div className="p-2 text-sm text-red-500">
              Não foi possível carregar os colaboradores
            </div>
          ) : (
            safeCollaborators.map((collaborator) => (
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
