
import { useMemo } from "react";
import { FinancialTitle } from "./types/financialTypes";

export const useClientFilteredTitles = (
  filteredTitles: FinancialTitle[],
  selectedClient: string | null
) => {
  // Apply client filtering to titles
  const clientFilteredTitles = useMemo(() => {
    if (!selectedClient) {
      return filteredTitles;
    }
    return filteredTitles.filter(title => String(title.PES_CODIGO) === selectedClient);
  }, [filteredTitles, selectedClient]);

  return clientFilteredTitles;
};
