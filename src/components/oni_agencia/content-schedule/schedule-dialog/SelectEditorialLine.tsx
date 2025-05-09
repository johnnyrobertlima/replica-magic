
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

interface SelectEditorialLineProps {
  editorialLines: any[];
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function SelectEditorialLine({ 
  editorialLines, 
  value, 
  isLoading, 
  onChange 
}: SelectEditorialLineProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="editorial_line_id">Linha Editorial</Label>
      <Select
        disabled={isLoading}
        value={value || ""}
        onValueChange={onChange}
        data-testid="editorial-line-select"
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma linha editorial" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="">-- Nenhum --</SelectItem>
            {editorialLines && editorialLines.length > 0 && editorialLines.map((line) => (
              <SelectItem key={line.id} value={line.id}>
                {line.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
