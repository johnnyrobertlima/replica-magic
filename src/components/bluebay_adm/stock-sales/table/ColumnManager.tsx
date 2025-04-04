
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnsIcon } from "lucide-react";

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
        <Button variant="outline" size="sm" className="ml-auto gap-1">
          <ColumnsIcon className="h-4 w-4" />
          <span>Colunas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Colunas visíveis</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={visibleColumns[column.id] || false}
            onCheckedChange={(checked) => onColumnToggle(column.id, checked)}
          >
            {column.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
