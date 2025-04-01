
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface ReportGroupHeaderProps {
  groupName: string;
  itemCount: number;
  isExpanded: boolean;
  toggleGroup: (groupName: string) => void;
  quantities: {
    quantidade: number;
    valor: number;
    ocorrencias: number;
  };
}

export const ReportGroupHeader = ({
  groupName,
  itemCount,
  isExpanded,
  toggleGroup,
  quantities
}: ReportGroupHeaderProps) => {
  return (
    <TableRow 
      className="bg-muted/30 font-medium cursor-pointer hover:bg-muted/50"
      onClick={() => toggleGroup(groupName)}
    >
      <TableCell>
        {isExpanded ? 
          <ChevronDown className="h-4 w-4" /> : 
          <ChevronRight className="h-4 w-4" />
        }
      </TableCell>
      <TableCell colSpan={2} className="font-semibold">
        {groupName} ({itemCount} itens)
      </TableCell>
      <TableCell className="text-right font-medium">
        {quantities.quantidade}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(quantities.valor)}
      </TableCell>
      <TableCell className="text-right font-medium">
        {quantities.ocorrencias}
      </TableCell>
    </TableRow>
  );
};
