
import React from "react";
import { ArrowUpDown } from "lucide-react";
import { StockItem } from "@/services/bluebay/stockSales/types";
import { TableHead } from "@/components/ui/table";

interface TableSortableHeaderProps {
  sortKey: keyof StockItem;
  label: string;
  currentSortConfig: {
    key: keyof StockItem;
    direction: 'asc' | 'desc';
  };
  onSort: (key: keyof StockItem) => void;
}

export const TableSortableHeader: React.FC<TableSortableHeaderProps> = ({
  sortKey,
  label,
  currentSortConfig,
  onSort
}) => {
  const isActive = currentSortConfig.key === sortKey;
  
  return (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center">
        {label}
        <ArrowUpDown 
          className={`inline ml-1 h-4 w-4 ${isActive ? 'text-primary' : 'text-gray-400'}`}
        />
      </div>
    </TableHead>
  );
};
