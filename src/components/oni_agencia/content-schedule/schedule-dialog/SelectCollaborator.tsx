
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SelectCollaboratorProps {
  collaborators: any[];
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function SelectCollaborator({ 
  collaborators, 
  value, 
  isLoading, 
  onChange 
}: SelectCollaboratorProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="collaborator_id">Responsável</Label>
      <Select
        disabled={isLoading}
        value={value}
        onValueChange={onChange}
        data-testid="collaborator-select"
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um responsável" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="">-- Nenhum --</SelectItem>
            {collaborators && collaborators.length > 0 && collaborators.map((collaborator) => (
              <SelectItem key={collaborator.id} value={collaborator.id}>
                {collaborator.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
