
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

interface ItemRowProps {
  item: any;
  isSelected: boolean;
  onItemClick: (itemCode: string) => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({ item, isSelected, onItemClick }) => {
  return (
    <TableRow className={isSelected ? "bg-muted/50" : undefined}>
      <TableCell className="font-mono">{item.ITEM_CODIGO}</TableCell>
      <TableCell>{item.DESCRICAO}</TableCell>
      <TableCell className="text-right">{item.TOTAL_QUANTIDADE.toLocaleString()}</TableCell>
      <TableCell className="text-right">{formatCurrency(item.TOTAL_VALOR)}</TableCell>
      <TableCell className="text-right">{item.OCORRENCIAS}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onItemClick(item.ITEM_CODIGO)}
        >
          {isSelected ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};
