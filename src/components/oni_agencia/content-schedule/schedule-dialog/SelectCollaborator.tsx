
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
        value={value || "null"}
        onValueChange={onChange}
        data-testid="collaborator-select"
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Selecione um responsável" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            <SelectItem value="null">-- Nenhum --</SelectItem>
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
