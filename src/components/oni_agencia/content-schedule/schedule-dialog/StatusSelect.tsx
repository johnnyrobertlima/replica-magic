
import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StatusSelectProps {
  statuses: any[];
  value: string;
  isLoading: boolean;
  onValueChange: (value: string) => void;
  required?: boolean;
}

export function StatusSelect({
  statuses,
  value,
  isLoading,
  onValueChange,
  required = false
}: StatusSelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione um status" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <SelectItem value="loading" disabled>
            Carregando...
          </SelectItem>
        ) : (
          statuses.map((status: any) => (
            <SelectItem key={status.id} value={status.id}>
              {status.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
