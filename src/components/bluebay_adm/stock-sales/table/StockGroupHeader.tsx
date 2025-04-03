
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/components/bluebay_adm/stock-sales/utils/formatters";
import { GroupedStockData } from "@/hooks/bluebay_adm/stock-sales/useStockGrouping";

interface StockGroupHeaderProps {
  group: GroupedStockData;
  onToggle: () => void;
}

export const StockGroupHeader: React.FC<StockGroupHeaderProps> = ({ group, onToggle }) => {
  return (
    <TableRow 
      className="bg-muted/50 hover:bg-muted/70 cursor-pointer transition-colors"
      onClick={onToggle}
    >
      <TableCell className="font-semibold flex items-center">
        {group.isExpanded ? 
          <ChevronDown className="h-4 w-4 mr-2" /> : 
          <ChevronRight className="h-4 w-4 mr-2" />
        }
        {group.groupName} ({group.totalItems} itens)
      </TableCell>
      <TableCell className="font-medium text-right">
        {group.totalFisico.toLocaleString()}
      </TableCell>
      <TableCell className="font-medium text-right">
        {group.totalDisponivel.toLocaleString()}
      </TableCell>
      <TableCell className="font-medium text-right">
        {group.totalReservado.toLocaleString()}
      </TableCell>
      <TableCell className="font-medium text-right">
        {/* These would be calculated if we had the data */}
        -
      </TableCell>
      <TableCell className="font-medium text-right">
        {/* These would be calculated if we had the data */}
        -
      </TableCell>
      <TableCell className="font-medium text-right">
        {/* These would be calculated if we had the data */}
        -
      </TableCell>
    </TableRow>
  );
};
