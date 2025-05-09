
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

interface SelectStatusProps {
  statuses: any[];
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function SelectStatus({ 
  statuses, 
  value, 
  isLoading, 
  onChange 
}: SelectStatusProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="status_id">Status</Label>
      <Select
        disabled={isLoading}
        value={value || ""}
        onValueChange={onChange}
        data-testid="status-select"
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Selecione um status" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            <SelectItem value="">-- Nenhum --</SelectItem>
            {statuses && statuses.length > 0 && statuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
