
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MessageSquare, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { ClientDebtSummary } from "@/hooks/bluebay/types/financialTypes";

interface ClientSummaryRowProps {
  isExpanded: boolean;
  summary: ClientDebtSummary;
  isCollected: boolean;
  onToggleExpand: () => void;
  onOpenCollectionDialog: () => void;
}

export const ClientSummaryRow: React.FC<ClientSummaryRowProps> = ({
  isExpanded,
  summary,
  isCollected,
  onToggleExpand,
  onOpenCollectionDialog,
}) => {
  return (
    <TableRow className="hover:bg-muted/50 cursor-pointer" onClick={onToggleExpand}>
      <TableCell>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </TableCell>
      <TableCell>{summary.PES_CODIGO}</TableCell>
      <TableCell className="max-w-[200px] truncate" title={summary.CLIENTE_NOME}>
        {summary.CLIENTE_NOME}
      </TableCell>
      <TableCell>{summary.QUANTIDADE_TITULOS}</TableCell>
      <TableCell className="text-amber-600 font-medium">{summary.DIAS_VENCIDO_MAXIMO} dias</TableCell>
      <TableCell className="text-red-600 font-medium">{formatCurrency(summary.TOTAL_SALDO)}</TableCell>
      <TableCell className="text-right">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            onOpenCollectionDialog();
          }}
          className={isCollected ? "bg-green-50" : ""}
        >
          {isCollected ? (
            <>
              <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
              Cobrado
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4 mr-1" />
              Realizar Cobrança
            </>
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};
