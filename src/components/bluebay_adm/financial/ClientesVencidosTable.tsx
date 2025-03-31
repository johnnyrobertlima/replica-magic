
import React from "react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";
import { formatCurrency } from "@/utils/formatters";
import { FinancialTitle } from "@/hooks/bluebay/types/financialTypes";

interface ClientesVencidosTableProps {
  titles: FinancialTitle[];
  isLoading: boolean;
}

export const ClientesVencidosTable: React.FC<ClientesVencidosTableProps> = ({ titles, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-12" />
        ))}
      </div>
    );
  }

  // Filter only titles that are overdue (vencidos)
  const vencidosTitles = titles.filter(title => {
    if (!title.DTVENCIMENTO) return false;
    const vencimentoDate = new Date(title.DTVENCIMENTO);
    const today = new Date();
    return vencimentoDate < today && title.VLRSALDO > 0;
  });

  if (vencidosTitles.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhum título vencido encontrado</p>
        <p className="text-sm text-muted-foreground">Todos os títulos estão em dia</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data Emissão</TableHead>
            <TableHead>Data Vencimento</TableHead>
            <TableHead>Dias Vencido</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Valor Saldo</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vencidosTitles.map((title) => {
            const vencimentoDate = new Date(title.DTVENCIMENTO);
            const today = new Date();
            const diasVencido = differenceInDays(today, vencimentoDate);
            
            return (
              <TableRow key={`${title.NUMLCTO}-${title.ANOBASE}`}>
                <TableCell className="font-medium">{title.NUMNOTA}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={title.CLIENTE_NOME}>
                  {title.CLIENTE_NOME}
                </TableCell>
                <TableCell>
                  {title.DTEMISSAO ? format(new Date(title.DTEMISSAO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </TableCell>
                <TableCell>
                  {title.DTVENCIMENTO ? format(new Date(title.DTVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) : '-'}
                </TableCell>
                <TableCell className="text-red-600 font-medium">
                  {diasVencido} dias
                </TableCell>
                <TableCell>{formatCurrency(title.VLRTITULO)}</TableCell>
                <TableCell>{formatCurrency(title.VLRSALDO)}</TableCell>
                <TableCell><StatusBadge status={title.STATUS} /></TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
