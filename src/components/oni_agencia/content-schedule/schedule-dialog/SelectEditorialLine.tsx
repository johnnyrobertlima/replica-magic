
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
        value={value || "null"}
        onValueChange={onChange}
        data-testid="editorial-line-select"
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Selecione uma linha editorial" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            <SelectItem value="null">-- Nenhum --</SelectItem>
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
