
import { useMemo } from "react";
import { ClientOrderGroup } from "@/types/clientOrders";

export const useBkPeriodTotals = (filteredGroups: Record<string, ClientOrderGroup>) => {
  // Calculate period-specific totals based on filtered groups
  const periodTotals = useMemo(() => {
    let valorTotalSaldoPeriodo = 0;
    let valorFaturarComEstoquePeriodo = 0;
    let valoresLiberadosParaFaturamento = 0;

    Object.values(filteredGroups).forEach(group => {
      valorTotalSaldoPeriodo += group.totalValorSaldo || 0;
      valorFaturarComEstoquePeriodo += group.totalValorFaturarComEstoque || 0;
      
      // Only count for valoresLiberadosParaFaturamento if client has no overdue titles
      if ((group.valorVencido || 0) <= 0) {
        valoresLiberadosParaFaturamento += group.totalValorFaturarComEstoque || 0;
      }
    });

    return {
      valorTotalSaldoPeriodo,
      valorFaturarComEstoquePeriodo,
      valoresLiberadosParaFaturamento
    };
  }, [filteredGroups]);

  return periodTotals;
};
