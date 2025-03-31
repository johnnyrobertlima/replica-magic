
import { useState, useCallback } from "react";
import { DateRange, FinancialTitle, ConsolidatedInvoice } from "./types/financialTypes";
import { format, subDays } from "date-fns";
import { usePagination } from "./hooks/usePagination";
import { fetchTitulos, fetchTitulosComDataNula, fetchFaturamento } from "./services/financialQueryService";
import { processTitles, processInvoices } from "./services/financialDataProcessor";

export type { FinancialTitle, ConsolidatedInvoice } from "./types/financialTypes";

export const useFinancialData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [consolidatedInvoices, setConsolidatedInvoices] = useState<ConsolidatedInvoice[]>([]);
  const [financialTitles, setFinancialTitles] = useState<FinancialTitle[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  // Use o hook de paginação
  const pagination = usePagination(1000);
  const { currentPage, pageSize, updateTotalCount } = pagination;

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      console.info("Iniciando refreshData - buscando dados financeiros");
      
      // 1. Buscar títulos com paginação e contagem
      const { data: allTitulos, count } = await fetchTitulos(dateRange, currentPage, pageSize);
      
      // Atualizar contagem total para paginação
      if (count !== null) {
        updateTotalCount(count);
      }
      
      // 2. Processar títulos e obter dados de clientes
      const { processedTitles, clientesMap, uniqueStatuses } = await processTitles(allTitulos);
      
      // Atualizar estados com títulos processados e status disponíveis
      setFinancialTitles(processedTitles);
      setAvailableStatuses(['all', ...uniqueStatuses]);
      
      // 3. Buscar dados de faturamento
      const faturamento = await fetchFaturamento(dateRange);
      
      // 4. Processar invoices combinando com títulos
      const consolidatedData = processInvoices(faturamento, clientesMap, processedTitles);
      setConsolidatedInvoices(consolidatedData);
      
    } catch (error) {
      console.error("Erro geral ao buscar dados financeiros:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, currentPage, pageSize, updateTotalCount]);

  const updateDateRange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
    // Reset pagination when date range changes
    pagination.currentPage = 1;
  }, [pagination]);

  return {
    isLoading,
    consolidatedInvoices,
    financialTitles,
    availableStatuses,
    dateRange,
    updateDateRange,
    refreshData,
    pagination
  };
};
