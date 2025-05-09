
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
import { OniAgenciaClient } from "@/types/oni-agencia";

interface SelectClientProps {
  clients: OniAgenciaClient[];
  value: string;
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function SelectClient({ 
  clients, 
  value, 
  isLoading, 
  onChange 
}: SelectClientProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="client_id">Cliente</Label>
      <Select
        disabled={isLoading || clients.length === 0}
        value={value || "null"}
        onValueChange={onChange}
        data-testid="client-select"
      >
        <SelectTrigger className="w-full bg-white">
          <SelectValue placeholder="Selecione um cliente" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectGroup>
            <SelectItem value="null">-- Nenhum --</SelectItem>
            {clients && clients.length > 0 && clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
