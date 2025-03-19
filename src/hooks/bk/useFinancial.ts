
import { useEffect } from "react";
import { useFinancialData } from "./financial/useFinancialData";
import { useFinancialFilters } from "./financial/useFinancialFilters";
import { useFinancialSummaries } from "./financial/useFinancialSummaries";
import { UseFinancialReturnType } from "./financial/types";

// Use 'export type' instead of 'export' for type re-exports
export type { DateRange, FinancialSummary, ClientFinancialSummary } from "./financial/types";

export const useFinancial = (): UseFinancialReturnType => {
  const {
    isLoading,
    consolidatedInvoices,
    financialTitles,
    availableStatuses,
    dateRange,
    updateDateRange,
    refreshData
  } = useFinancialData();

  const {
    statusFilter,
    updateStatusFilter,
    clientFilter,
    updateClientFilter,
    notaFilter,
    updateNotaFilter,
    filteredInvoices,
    filteredTitles,
    filterClientSummaries
  } = useFinancialFilters(consolidatedInvoices, financialTitles, []);

  const {
    financialSummary,
    clientFinancialSummaries
  } = useFinancialSummaries(filteredInvoices);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    isLoading,
    consolidatedInvoices,
    filteredInvoices,
    financialTitles,
    filteredTitles,
    refreshData,
    dateRange,
    updateDateRange,
    statusFilter,
    updateStatusFilter,
    availableStatuses,
    clientFilter,
    updateClientFilter,
    notaFilter,
    updateNotaFilter,
    financialSummary,
    clientFinancialSummaries,
    filterClientSummaries
  };
};
