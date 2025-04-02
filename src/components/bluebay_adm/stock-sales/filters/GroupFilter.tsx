
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Filter } from "lucide-react";

interface GroupFilterProps {
  groupFilter: string;
  onGroupFilterChange: (value: string) => void;
  availableGroups: string[];
}

export const GroupFilter: React.FC<GroupFilterProps> = ({
  groupFilter,
  onGroupFilterChange,
  availableGroups,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-gray-500" />
      <Select
        value={groupFilter}
        onValueChange={onGroupFilterChange}
      >
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Filtrar por grupo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os grupos</SelectItem>
          {availableGroups.map((group) => (
            <SelectItem key={group} value={group}>
              {group}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
