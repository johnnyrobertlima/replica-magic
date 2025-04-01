
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";

interface GroupHeaderProps {
  grupo: string;
  itemCount: number;
  totalQuantity: number;
  totalValue: number;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({ 
  grupo, 
  itemCount, 
  totalQuantity, 
  totalValue 
}) => {
  return (
    <div className="bg-muted p-3 font-medium flex justify-between items-center">
      <div>
        <span>{grupo}</span>
        <span className="ml-2 text-sm text-muted-foreground">
          ({itemCount} itens)
        </span>
      </div>
      <div className="flex space-x-4 text-sm">
        <span>Quantidade: {totalQuantity.toLocaleString()}</span>
        <span>Total: {formatCurrency(totalValue)}</span>
      </div>
    </div>
  );
};
