
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

interface SelectCreatorsProps {
  collaborators: any[];
  value: string[];
  isLoading: boolean;
  onChange: (value: string) => void;
  label?: string;
}

export function SelectCreators({ 
  collaborators, 
  value, 
  isLoading, 
  onChange,
  label = "Criadores"
}: SelectCreatorsProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="creators">{label}</Label>
      <Select
        disabled={isLoading}
        value={value.length > 0 ? value[0] : ""}
        onValueChange={(val) => onChange(val)}
        data-testid="creators-select"
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder={`Selecione ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent className="bg-white">
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
