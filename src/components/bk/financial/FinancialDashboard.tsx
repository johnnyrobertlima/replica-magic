
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

interface Invoice {
  NOTA: string;
  DATA_EMISSAO: string | null;
  PES_CODIGO: number | null;
  STATUS: string | null;
  VALOR_NOTA: number | null;
  ITEMS_COUNT: number;
  CLIENTE_NOME?: string | null;
  fator_correcao?: number | null;
}

interface FinancialDashboardProps {
  invoices: Invoice[];
}

export const FinancialDashboard = ({ invoices }: FinancialDashboardProps) => {
  // Calculate summary metrics with factor correction
  const totalInvoices = invoices.length;
  
  const totalValue = invoices.reduce((sum, invoice) => {
    const baseValue = invoice.VALOR_NOTA || 0;
    const fator = invoice.fator_correcao && invoice.fator_correcao > 0 
      ? invoice.fator_correcao 
      : 1;
    return sum + (baseValue * fator);
  }, 0);
  
  const averageValue = totalInvoices > 0 ? totalValue / totalInvoices : 0;
  
  // Count invoices by status
  const statusCounts: Record<string, number> = invoices.reduce((counts: Record<string, number>, invoice) => {
    const status = invoice.STATUS || 'Desconhecido';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInvoices}</div>
          <p className="text-xs text-muted-foreground">
            Consolidado por número de nota fiscal
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            Soma do valor de todas as notas (com fator de correção)
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Médio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageValue)}</div>
          <p className="text-xs text-muted-foreground">
            Média do valor das notas
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="text-sm">{status}</div>
                <div className="font-medium">{count}</div>
              </div>
            ))}
            {Object.keys(statusCounts).length === 0 && (
              <div className="text-sm text-muted-foreground">Nenhum dado disponível</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
