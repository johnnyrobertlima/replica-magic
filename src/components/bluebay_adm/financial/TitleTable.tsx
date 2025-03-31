
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "@/utils/formatters";
import { FinancialTitle } from "@/hooks/bluebay/types/financialTypes";
import { formatNumDocumento } from "@/hooks/bluebay/utils/titleUtils";

interface TitleTableProps {
  titles: FinancialTitle[];
  isLoading: boolean;
}

export const TitleTable: React.FC<TitleTableProps> = ({ titles, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  if (titles.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhum título financeiro encontrado</p>
        <p className="text-sm text-muted-foreground">Tente ajustar os filtros para ver mais resultados</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nota Fiscal</TableHead>
            <TableHead>Nº do Documento</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data Emissão</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Saldo</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {titles.map((title, index) => (
            <TableRow key={`${title.NUMNOTA}-${index}`}>
              <TableCell className="font-medium">{title.NUMNOTA}</TableCell>
              <TableCell className="font-mono">{formatNumDocumento(title.NUMDOCUMENTO)}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={title.CLIENTE_NOME}>
                {title.CLIENTE_NOME}
              </TableCell>
              <TableCell>
                {title.DTEMISSAO ? format(new Date(title.DTEMISSAO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell>
                {title.DTVENCIMENTO ? format(new Date(title.DTVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell>
                {title.DTPAGTO ? format(new Date(title.DTPAGTO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
              </TableCell>
              <TableCell>{formatCurrency(title.VLRTITULO)}</TableCell>
              <TableCell>{formatCurrency(title.VLRSALDO)}</TableCell>
              <TableCell><StatusBadge status={title.STATUS} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
