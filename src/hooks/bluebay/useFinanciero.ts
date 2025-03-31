
import { useEffect } from "react";
import { useFinancialData } from "./useFinancialData";
import { useFinancialFilters } from "./useFinancialFilters";
import { useFinancialSummaries } from "./useFinancialSummaries";

export const useFinanciero = () => {
  const {
    isLoading,
    consolidatedInvoices,
    financialTitles,
    availableStatuses,
    dateRange,
    updateDateRange,
    refreshData,
    pagination
  } = useFinancialData();

  const {
    statusFilter,
    updateStatusFilter,
    clientFilter,
    updateClientFilter,
    notaFilter,
    updateNotaFilter,
    filteredInvoices,
    filteredTitles
  } = useFinancialFilters(consolidatedInvoices, financialTitles);

  const {
    financialSummary,
    clientFinancialSummaries
  } = useFinancialSummaries(filteredInvoices, filteredTitles);

  // Initial data load
  useEffect(() => {
    console.log("useFinanciero effect - disparando atualização de dados");
    refreshData();
  }, [refreshData]);

  // Log data for debugging
  useEffect(() => {
    console.log("consolidatedInvoices:", consolidatedInvoices.length);
    console.log("financialTitles:", financialTitles.length);
    console.log("filteredInvoices:", filteredInvoices.length);
    console.log("filteredTitles:", filteredTitles.length);
  }, [consolidatedInvoices, financialTitles, filteredInvoices, filteredTitles]);

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
    pagination
  };
};
