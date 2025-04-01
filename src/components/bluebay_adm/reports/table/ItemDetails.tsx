
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ItemDetailsTable } from "../ItemDetailsTable";

interface ItemDetailsProps {
  itemCode: string;
  details: any[];
  isLoading: boolean;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({ itemCode, details, isLoading }) => {
  return (
    <TableRow>
      <TableCell colSpan={6} className="p-0 border-t-0">
        <div className="bg-muted/30 p-4">
          <ItemDetailsTable details={details} isLoading={isLoading} />
        </div>
      </TableCell>
    </TableRow>
  );
};
