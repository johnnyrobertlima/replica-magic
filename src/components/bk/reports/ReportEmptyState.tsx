
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";

export const ReportEmptyState = () => {
  return (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
        Nenhum item encontrado
      </TableCell>
    </TableRow>
  );
};
