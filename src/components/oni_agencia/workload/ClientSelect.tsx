
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClients } from "@/hooks/useOniAgenciaClients";

interface ClientSelectProps {
  value: string;
  onChange: (clientId: string) => void;
}

export function ClientSelect({ value, onChange }: ClientSelectProps) {
  const { data: clients = [], isLoading } = useClients();

  // Handle the special "all" value
  const handleChange = (newValue: string) => {
    // Convert "all" back to empty string for the parent component
    onChange(newValue === "all" ? "" : newValue);
  };

  return (
    <div className={cn("space-y-2")}>
      <Select 
        value={value === "" ? "all" : value} 
        onValueChange={handleChange}
        disabled={isLoading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os clientes</SelectItem>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
