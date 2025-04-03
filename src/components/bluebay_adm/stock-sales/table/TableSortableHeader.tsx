
import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
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
  align?: "left" | "right" | "center";
}

export const TableSortableHeader: React.FC<TableSortableHeaderProps> = ({
  sortKey,
  label,
  currentSortConfig,
  onSort,
  className = "",
  align = "left"
}) => {
  const isActive = currentSortConfig.key === sortKey;
  const textAlignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 sticky top-0 bg-white z-30 whitespace-nowrap ${textAlignClass} ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className={`flex items-center ${align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"} gap-1 h-full`}>
        {label}
        {isActive ? (
          currentSortConfig.direction === 'asc' ? (
            <ArrowUp className="h-4 w-4 flex-shrink-0 text-primary" />
          ) : (
            <ArrowDown className="h-4 w-4 flex-shrink-0 text-primary" />
          )
        ) : (
          <div className="h-4 w-4 opacity-0">•</div>
        )}
      </div>
    </TableHead>
  );
};
