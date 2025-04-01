
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { format, parseISO } from "date-fns";

interface ItemDetailsTableProps {
  details: any[];
  isLoading: boolean;
}

export const ItemDetailsTable: React.FC<ItemDetailsTableProps> = ({ 
  details, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground text-sm">Carregando detalhes...</span>
      </div>
    );
  }

  if (!details || details.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">Nenhum detalhe encontrado para este item.</p>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-medium mb-2">Detalhes do Item</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Valor Unit.</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {details.map((detail, index) => (
            <TableRow key={index}>
              <TableCell>
                {detail.DATA_PEDIDO 
                  ? format(parseISO(detail.DATA_PEDIDO), 'dd/MM/yyyy') 
                  : 'N/A'}
              </TableCell>
              <TableCell>{detail.PED_NUMPEDIDO || 'N/A'}</TableCell>
              <TableCell>{detail.CLIENTE_NOME}</TableCell>
              <TableCell className="text-right">{Number(detail.QUANTIDADE).toLocaleString()}</TableCell>
              <TableCell className="text-right">{formatCurrency(detail.VALOR_UNITARIO)}</TableCell>
              <TableCell className="text-right">{formatCurrency(detail.TOTAL)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
