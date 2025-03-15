
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";

interface InvoiceItem {
  NOTA: string;
  QUANTIDADE: number | null;
  VALOR_UNITARIO: number | null;
  ITEM_CODIGO: string | null;
  FATOR_CORRECAO?: number | null;
}

interface InvoiceItemsTableProps {
  invoiceItems: InvoiceItem[];
  isLoadingItems: boolean;
}

export const InvoiceItemsTable = ({ invoiceItems, isLoadingItems }: InvoiceItemsTableProps) => {
  if (isLoadingItems) {
    return (
      <div className="py-4 flex justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="rounded overflow-hidden border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código do Item</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Valor Unit.</TableHead>
            <TableHead className="text-right">Valor Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoiceItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                Nenhum item encontrado para esta nota
              </TableCell>
            </TableRow>
          ) : (
            invoiceItems.map((item, index) => {
              // Apply correction factor to unit value if it exists and is not 0
              const fatorCorrecao = item.FATOR_CORRECAO && item.FATOR_CORRECAO > 0 
                ? item.FATOR_CORRECAO 
                : null;
              
              const valorUnitario = item.VALOR_UNITARIO || 0;
              const valorUnitarioAjustado = fatorCorrecao 
                ? valorUnitario * fatorCorrecao 
                : valorUnitario;
              
              const valorTotal = (item.QUANTIDADE || 0) * valorUnitarioAjustado;
              
              return (
                <TableRow key={`${item.NOTA}-${item.ITEM_CODIGO}-${index}`}>
                  <TableCell>{item.ITEM_CODIGO || '-'}</TableCell>
                  <TableCell className="text-right">{item.QUANTIDADE || 0}</TableCell>
                  <TableCell className="text-right">
                    {valorUnitario ? (
                      <span className={fatorCorrecao ? "text-blue-500" : ""}>
                        {formatCurrency(valorUnitarioAjustado)}
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(valorTotal)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
