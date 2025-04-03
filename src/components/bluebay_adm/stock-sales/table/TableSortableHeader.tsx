
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
  className?: string;
}

export const TableSortableHeader: React.FC<TableSortableHeaderProps> = ({
  sortKey,
  label,
  currentSortConfig,
  onSort,
  className = ""
}) => {
  const isActive = currentSortConfig.key === sortKey;
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 sticky top-0 z-20 ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center w-full justify-start">
        {label}
        <ArrowUpDown 
          className={`ml-1 h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-400'}`}
        />
      </div>
    </TableHead>
  );
};
