
import React, { useMemo } from "react";
import { AbcCurveChart } from "./AbcCurveChart";
import { ConsolidatedInvoice } from "@/services/bk/types/financialTypes";

interface ClientsAbcCurveProps {
  invoices: ConsolidatedInvoice[];
  isLoading: boolean;
}

export const ClientsAbcCurve = ({ invoices, isLoading }: ClientsAbcCurveProps) => {
  const clientsData = useMemo(() => {
    if (!invoices.length) return [];

    // Agrupar faturamento por cliente
    const clientTotals = new Map<string, number>();
    
    invoices.forEach(invoice => {
      if (invoice.CLIENTE_NOME) {
        const currentTotal = clientTotals.get(invoice.CLIENTE_NOME) || 0;
        clientTotals.set(invoice.CLIENTE_NOME, currentTotal + (invoice.VALOR_NOTA || 0));
      }
    });
    
    // Converter para o formato esperado pelo gráfico
    return Array.from(clientTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);
  }, [invoices]);

  return (
    <AbcCurveChart 
      data={clientsData}
      title="Curva ABC de Clientes"
      description="Distribuição de faturamento por cliente"
      isLoading={isLoading}
    />
  );
};
