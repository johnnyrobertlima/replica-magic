
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { ItemDetailsTable } from "./ItemDetailsTable";
import { ItemReport } from "@/services/bluebay/types";

interface ReportItemRowProps {
  item: ItemReport;
  selectedItem: string | null;
  handleItemClick: (itemCode: string) => void;
  selectedItemDetails: any[];
  isLoadingDetails: boolean;
}

export const ReportItemRow = ({ 
  item, 
  selectedItem, 
  handleItemClick, 
  selectedItemDetails, 
  isLoadingDetails 
}: ReportItemRowProps) => {
  const isSelected = selectedItem === item.ITEM_CODIGO;

  return (
    <React.Fragment>
      <TableRow 
        className={isSelected ? "bg-muted" : "cursor-pointer"}
        onClick={() => handleItemClick(item.ITEM_CODIGO)}
      >
        <TableCell>
          {isSelected ? 
            <ChevronDown className="h-4 w-4 ml-4" /> : 
            <ChevronRight className="h-4 w-4 ml-4" />
          }
        </TableCell>
        <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
        <TableCell>{item.DESCRICAO || '-'}</TableCell>
        <TableCell className="text-right">{item.TOTAL_QUANTIDADE}</TableCell>
        <TableCell className="text-right">
          {formatCurrency(item.TOTAL_VALOR)}
        </TableCell>
        <TableCell className="text-right">{item.OCORRENCIAS}</TableCell>
      </TableRow>
      
      {isSelected && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/30 p-0">
            <div className="px-4 py-2">
              <h4 className="font-medium mb-2">Detalhes do Item {item.ITEM_CODIGO}</h4>
              <ItemDetailsTable 
                itemDetails={selectedItemDetails}
                isLoadingDetails={isLoadingDetails}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};
