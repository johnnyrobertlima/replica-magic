
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatters";

interface FinancialSummaryCardsProps {
  totalValoresVencidos: number;
  totalPago: number;
  totalEmAberto: number;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  totalValoresVencidos,
  totalPago,
  totalEmAberto
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Valores Vencidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalValoresVencidos)}</div>
          <p className="text-xs text-muted-foreground">
            Soma do valor saldo de títulos vencidos
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPago)}</div>
          <p className="text-xs text-muted-foreground">
            Soma do valor pago de títulos no período
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total em Aberto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalEmAberto)}</div>
          <p className="text-xs text-muted-foreground">
            Soma do valor saldo de títulos ainda não vencidos
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
