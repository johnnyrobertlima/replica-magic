
import React from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/utils/formatters";
import { Loader2 } from "lucide-react";

export interface ClientFinancialSummary {
  PES_CODIGO: string;
  CLIENTE_NOME: string;
  totalValoresVencidos: number;
  totalPago: number;
  totalEmAberto: number;
}

interface ClientFinancialTableProps {
  clients: ClientFinancialSummary[];
  isLoading: boolean;
}

export const ClientFinancialTable: React.FC<ClientFinancialTableProps> = ({ clients, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum cliente encontrado com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Nome do Cliente</TableHead>
            <TableHead className="text-right">Valores Vencidos</TableHead>
            <TableHead className="text-right">Valores Pagos</TableHead>
            <TableHead className="text-right">Valores em Aberto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.PES_CODIGO}>
              <TableCell>{client.PES_CODIGO}</TableCell>
              <TableCell>{client.CLIENTE_NOME}</TableCell>
              <TableCell className={`text-right ${client.totalValoresVencidos > 0 ? 'text-red-600 font-medium' : ''}`}>
                {formatCurrency(client.totalValoresVencidos)}
              </TableCell>
              <TableCell className="text-right text-green-600">
                {formatCurrency(client.totalPago)}
              </TableCell>
              <TableCell className="text-right text-blue-600">
                {formatCurrency(client.totalEmAberto)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
