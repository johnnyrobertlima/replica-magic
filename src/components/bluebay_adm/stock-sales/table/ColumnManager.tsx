
import React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

interface ColumnOption {
  id: string;
  label: string;
}

interface ColumnManagerProps {
  columns: ColumnOption[];
  visibleColumns: Record<string, boolean>;
  onColumnToggle: (columnId: string, isVisible: boolean) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({
  columns,
  visibleColumns,
  onColumnToggle,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Colunas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Colunas Visíveis</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibleColumns[column.id] ?? true}
            onCheckedChange={(checked) => onColumnToggle(column.id, checked)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
