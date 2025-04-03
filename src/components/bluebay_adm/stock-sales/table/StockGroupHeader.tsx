
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency, formatTableNumber, formatTablePercentage } from "../utils/formatters";
import { GroupedStockData } from "@/hooks/bluebay_adm/stock-sales/useStockGrouping";
import { StockTurnoverIndicator } from "./StockTurnoverIndicator";

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
      <TableCell className="font-semibold flex items-center min-w-[250px] max-w-[250px]">
        {group.isExpanded ? 
          <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" /> : 
          <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
        }
        <div className="truncate">
          {group.groupName} ({group.totalItems} itens)
        </div>
      </TableCell>
      <TableCell className="font-medium text-right min-w-[120px]">
        {formatTableNumber(group.totalFisico)}
      </TableCell>
      <TableCell className="font-medium text-right min-w-[120px]">
        {formatTableNumber(group.totalDisponivel)}
      </TableCell>
      <TableCell className="font-medium text-right min-w-[120px]">
        {formatTableNumber(group.totalReservado)}
      </TableCell>
      <TableCell className="font-medium text-right min-w-[120px]">
        {formatTableNumber(group.totalVendido)}
      </TableCell>
      <TableCell className="font-medium text-right min-w-[150px]">
        {formatCurrency(group.totalValorVendido)}
      </TableCell>
      <TableCell className="font-medium text-right min-w-[120px]">
        <StockTurnoverIndicator turnover={group.giroEstoqueGrupo} />
      </TableCell>
      <TableCell className="font-medium text-right min-w-[100px]">
        {formatTablePercentage(group.percentualVendidoGrupo)}
      </TableCell>
      <TableCell className="font-medium text-right min-w-[120px]">
        {Math.round(group.diasCoberturaGrupo).toLocaleString()}
      </TableCell>
      <TableCell className="font-medium text-center min-w-[120px]">
        -
      </TableCell>
      <TableCell className="font-medium text-right min-w-[100px]">
        -
      </TableCell>
    </TableRow>
  );
};
