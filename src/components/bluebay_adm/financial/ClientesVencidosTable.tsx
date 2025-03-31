
import React from "react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/formatters";
import { FinancialTitle } from "@/hooks/bluebay/useFinancialData";

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

  // Filter only overdue titles
  const today = new Date();
  const overdueClients = titles.filter(title => {
    if (!title.DTVENCIMENTO) return false;
    const vencimento = new Date(title.DTVENCIMENTO);
    return vencimento < today && (title.STATUS === "1" || title.STATUS === "2") && title.VLRSALDO > 0;
  });

  if (overdueClients.length === 0) {
    return (
      <div className="bg-muted/40 py-8 text-center rounded-md">
        <p className="text-muted-foreground">Nenhum cliente com títulos vencidos encontrado</p>
        <p className="text-sm text-muted-foreground">Todos os clientes estão com pagamentos em dia</p>
      </div>
    );
  }

  // Group by client
  const clientsMap = new Map<string | number, {
    client: string,
    titles: FinancialTitle[],
    totalOverdue: number
  }>();

  overdueClients.forEach(title => {
    const key = title.PES_CODIGO;
    if (!clientsMap.has(key)) {
      clientsMap.set(key, {
        client: title.CLIENTE_NOME || `Cliente ${key}`,
        titles: [],
        totalOverdue: 0
      });
    }
    
    const clientData = clientsMap.get(key)!;
    clientData.titles.push(title);
    clientData.totalOverdue += title.VLRSALDO || 0;
  });

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Nº Títulos Vencidos</TableHead>
            <TableHead>Total Vencido</TableHead>
            <TableHead>Título Mais Atrasado</TableHead>
            <TableHead>Dias de Atraso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from(clientsMap.values()).map(clientData => {
            // Find the oldest overdue title
            const oldestTitle = clientData.titles.reduce((oldest, current) => {
              if (!oldest.DTVENCIMENTO) return current;
              if (!current.DTVENCIMENTO) return oldest;
              
              const oldestDate = new Date(oldest.DTVENCIMENTO);
              const currentDate = new Date(current.DTVENCIMENTO);
              
              return oldestDate < currentDate ? oldest : current;
            }, clientData.titles[0]);
            
            // Calculate days overdue
            let daysOverdue = 0;
            if (oldestTitle.DTVENCIMENTO) {
              const vencimento = new Date(oldestTitle.DTVENCIMENTO);
              daysOverdue = differenceInDays(today, vencimento);
            }
            
            return (
              <TableRow key={String(clientData.client)}>
                <TableCell className="font-medium">{clientData.client}</TableCell>
                <TableCell>{clientData.titles.length}</TableCell>
                <TableCell>{formatCurrency(clientData.totalOverdue)}</TableCell>
                <TableCell>
                  {oldestTitle.DTVENCIMENTO 
                    ? format(new Date(oldestTitle.DTVENCIMENTO), 'dd/MM/yyyy', { locale: ptBR }) 
                    : '-'}
                </TableCell>
                <TableCell className="text-red-600 font-semibold">
                  {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
