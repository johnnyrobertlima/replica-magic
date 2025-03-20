
import { useMemo } from "react";
import { ClientOrderGroup } from "@/types/clientOrders";

export const useBkFilteredTotals = (filteredGroups: Record<string, ClientOrderGroup>) => {
  // Calculate new totals based on filtered groups
  const filteredTotals = useMemo(() => {
    let valorTotalPedido = 0;
    let clientesCount = 0;
    let faltaFaturar = 0;

    // Count number of clients
    clientesCount = Object.keys(filteredGroups).length;

    // Sum up values from all filtered client groups
    Object.values(filteredGroups).forEach(group => {
      valorTotalPedido += group.totalValorPedido || 0;
      faltaFaturar += group.totalValorSaldo || 0;
    });

    return {
      valorTotalPedido,
      clientesCount,
      faltaFaturar
    };
  }, [filteredGroups]);

  return filteredTotals;
};
