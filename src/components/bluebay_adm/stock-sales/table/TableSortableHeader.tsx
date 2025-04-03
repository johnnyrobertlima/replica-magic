
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
  width?: string;
  align?: 'left' | 'right' | 'center';
}

export const TableSortableHeader: React.FC<TableSortableHeaderProps> = ({
  sortKey,
  label,
  currentSortConfig,
  onSort,
  width = 'auto',
  align = 'left'
}) => {
  const isActive = currentSortConfig.key === sortKey;
  const alignmentClass = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
  
  return (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 whitespace-nowrap bg-gray-50 font-medium`}
      onClick={() => onSort(sortKey)}
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 30, 
        minWidth: width === 'auto' ? 'auto' : width,
        width: width === 'auto' ? 'auto' : width
      }}
    >
      <div className={`flex items-center ${alignmentClass} w-full`}>
        {label}
        <ArrowUpDown 
          className={`inline ml-1 h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-400'}`}
        />
      </div>
    </TableHead>
  );
};
