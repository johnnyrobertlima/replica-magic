
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FinancialTitle } from "@/services/bk/types/financialTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";

interface TitleTableProps {
  titles: FinancialTitle[];
  isLoading: boolean;
}

export const TitleTable: React.FC<TitleTableProps> = ({ titles, isLoading }) => {
  const formatCurrency = (value: number | null) => {
    if (value === null) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  const getStatusText = (status: string | null) => {
    const statusMap: Record<string, string> = {
      "1": "A Vencer",
      "2": "Vencido",
      "3": "Pago",
      "4": "Cancelado",
    };
    return status ? statusMap[status] || status : "Desconhecido";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (titles.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Nenhum título encontrado para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nota</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Data Emissão</TableHead>
            <TableHead>Data Vencimento</TableHead>
            <TableHead>Data Pagamento</TableHead>
            <TableHead>Valor Título</TableHead>
            <TableHead>Valor Desconto</TableHead>
            <TableHead>Valor Saldo</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {titles.map((title, index) => (
            <TableRow key={`${title.NUMNOTA}-${index}`}>
              <TableCell>{title.NUMNOTA || "-"}</TableCell>
              <TableCell>{title.CLIENTE_NOME || "-"}</TableCell>
              <TableCell>{formatDate(title.DTEMISSAO)}</TableCell>
              <TableCell>{formatDate(title.DTVENCIMENTO)}</TableCell>
              <TableCell>{formatDate(title.DTPAGTO)}</TableCell>
              <TableCell>{formatCurrency(title.VLRTITULO)}</TableCell>
              <TableCell>{formatCurrency(title.VLRDESCONTO)}</TableCell>
              <TableCell>{formatCurrency(title.VLRSALDO)}</TableCell>
              <TableCell>
                <StatusBadge status={title.STATUS || ""}>
                  {getStatusText(title.STATUS)}
                </StatusBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
