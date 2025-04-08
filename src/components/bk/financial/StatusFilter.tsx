
import React from 'react';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface StatusFilterProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  statuses: string[];
}

export const StatusFilter = ({ selectedStatus, onStatusChange, statuses }: StatusFilterProps) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Status:</span>
      <Select
        value={selectedStatus}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status || "não-definido"}>
              {status || "Não definido"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
