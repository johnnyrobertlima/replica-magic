
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
import { OniAgenciaCollaborator } from "@/types/oni-agencia";

interface CollaboratorSelectProps {
  collaborators: OniAgenciaCollaborator[];
  value: string;
  isLoading: boolean;
  onValueChange: (value: string) => void;
  label?: string;
  errorMessage?: string;
}

export function CollaboratorSelect({ 
  collaborators, 
  value, 
  isLoading, 
  onValueChange,
  label = "Responsável",
  errorMessage = "Erro ao carregar colaboradores" 
}: CollaboratorSelectProps) {
  // Add debug logs to help trace issues
  console.log("CollaboratorSelect rendering with value:", value);
  console.log("CollaboratorSelect has collaborators:", collaborators?.length);
  
  return (
    <div className="space-y-2">
      <Label htmlFor="collaborator_id" className="text-base font-medium">
        {label}
      </Label>
      <Select
        disabled={isLoading}
        value={value}
        onValueChange={(newValue) => {
          console.log("CollaboratorSelect changed to:", newValue);
          onValueChange(newValue);
        }}
        data-testid="collaborator-select"
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecione um responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="null">-- Nenhum --</SelectItem>
            {collaborators && collaborators.length > 0 ? (
              collaborators.map((collaborator) => (
                <SelectItem key={collaborator.id} value={collaborator.id}>
                  {collaborator.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="error" disabled>
                {isLoading ? "Carregando..." : errorMessage}
              </SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
