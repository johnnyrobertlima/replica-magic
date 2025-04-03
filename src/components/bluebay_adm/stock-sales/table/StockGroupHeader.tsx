
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
      <TableCell className="font-semibold w-[250px]">
        <div className="flex items-center">
          {group.isExpanded ? 
            <ChevronDown className="h-4 w-4 mr-2 flex-shrink-0" /> : 
            <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0" />
          }
          <span className="truncate">{group.groupName} ({group.totalItems} itens)</span>
        </div>
      </TableCell>
      <TableCell className="font-medium text-right w-[150px]">
        {formatTableNumber(group.totalFisico)}
      </TableCell>
      <TableCell className="font-medium text-right w-[120px]">
        {formatTableNumber(group.totalDisponivel)}
      </TableCell>
      <TableCell className="font-medium text-right w-[120px]">
        {formatTableNumber(group.totalReservado)}
      </TableCell>
      <TableCell className="font-medium text-right w-[130px]">
        {formatTableNumber(group.totalVendido)}
      </TableCell>
      <TableCell className="font-medium text-right w-[150px]">
        {formatCurrency(group.totalValorVendido)}
      </TableCell>
      <TableCell className="font-medium text-right w-[120px]">
        <StockTurnoverIndicator turnover={group.giroEstoqueGrupo} />
      </TableCell>
      <TableCell className="font-medium text-right w-[120px]">
        {formatTablePercentage(group.percentualVendidoGrupo)}
      </TableCell>
      <TableCell className="font-medium text-right w-[140px]">
        {Math.round(group.diasCoberturaGrupo).toLocaleString()}
      </TableCell>
      <TableCell className="font-medium text-center w-[130px]">
        -
      </TableCell>
      <TableCell className="font-medium text-right w-[100px]">
        -
      </TableCell>
    </TableRow>
  );
};
