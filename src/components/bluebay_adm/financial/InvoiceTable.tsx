
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "@/utils/formatters";
import { ConsolidatedInvoice } from "@/hooks/bluebay/useFinancialData";

interface InvoiceTableProps {
  invoices: ConsolidatedInvoice[];
  isLoading: boolean;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhuma nota fiscal encontrada</p>
        <p className="text-sm text-muted-foreground">Tente ajustar os filtros para ver mais resultados</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nota</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data Emissão</TableHead>
            <TableHead>Data Vencimento</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Valor Pago</TableHead>
            <TableHead>Saldo</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.NOTA}>
              <TableCell className="font-medium">{invoice.NOTA}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={invoice.CLIENTE_NOME}>
                {invoice.CLIENTE_NOME}
              </TableCell>
              <TableCell>
                {invoice.DATA_EMISSAO ? format(new Date(invoice.DATA_EMISSAO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell>
                {invoice.DATA_VENCIMENTO ? format(new Date(invoice.DATA_VENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell>{formatCurrency(invoice.VALOR_NOTA)}</TableCell>
              <TableCell>{formatCurrency(invoice.VALOR_PAGO)}</TableCell>
              <TableCell>{formatCurrency(invoice.VALOR_SALDO)}</TableCell>
              <TableCell><StatusBadge status={invoice.STATUS} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
