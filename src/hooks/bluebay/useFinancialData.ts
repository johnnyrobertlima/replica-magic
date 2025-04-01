import { useState, useCallback, useEffect } from "react";
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

  const pagination = usePagination(1000);
  const { currentPage, pageSize, updateTotalCount } = pagination;

  const [allTitles, setAllTitles] = useState<FinancialTitle[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setAllTitles([]);
    setHasMorePages(true);
    
    try {
      console.info("Iniciando refreshData - buscando dados financeiros");
      
      await loadTitulosPage(1);
      
      const faturamento = await fetchFaturamento(dateRange);
      
      if (allTitles.length > 0) {
        const { clientesMap } = await processTitles(allTitles);
        const consolidatedData = processInvoices(faturamento, clientesMap, allTitles);
        setConsolidatedInvoices(consolidatedData);
      }
      
      loadRemainingPages();
      
    } catch (error) {
      console.error("Erro geral ao buscar dados financeiros:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  const loadTitulosPage = useCallback(async (page: number) => {
    try {
      setIsLoadingMore(true);
      
      const { data: titulos, count } = await fetchTitulos(dateRange, page, pageSize);
      
      let titulosComDataNula: FinancialTitle[] = [];
      if (page === 1) {
        titulosComDataNula = await fetchTitulosComDataNula();
      }
      
      const todosTitulos = [...titulos, ...titulosComDataNula];
      
      if (count !== null) {
        updateTotalCount(count);
        setHasMorePages(page * pageSize < count);
      }
      
      const { processedTitles, uniqueStatuses } = await processTitles(todosTitulos);
      
      setAllTitles(prev => {
        const newTitles = [...prev];
        processedTitles.forEach(title => {
          const existingIndex = newTitles.findIndex(t => {
            if (title.MATRIZ && t.MATRIZ && 
                title.FILIAL && t.FILIAL && 
                title.NUMLCTO && t.NUMLCTO && 
                title.ANOBASE && t.ANOBASE) {
              return t.MATRIZ === title.MATRIZ && 
                     t.FILIAL === title.FILIAL && 
                     t.NUMLCTO === title.NUMLCTO && 
                     t.ANOBASE === title.ANOBASE;
            } else {
              return String(t.NUMNOTA) === String(title.NUMNOTA) && 
                     String(t.PES_CODIGO) === String(title.PES_CODIGO) &&
                     t.DTEMISSAO === title.DTEMISSAO;
            }
          });
          
          if (existingIndex === -1) {
            newTitles.push(title);
          }
        });
        
        return newTitles;
      });
      
      setFinancialTitles(prev => {
        if (page === 1) {
          return processedTitles;
        } else {
          const newTitles = [...prev];
          processedTitles.forEach(title => {
            const existingIndex = newTitles.findIndex(t => {
              if (title.MATRIZ && t.MATRIZ && 
                  title.FILIAL && t.FILIAL && 
                  title.NUMLCTO && t.NUMLCTO && 
                  title.ANOBASE && t.ANOBASE) {
                return t.MATRIZ === title.MATRIZ && 
                      t.FILIAL === title.FILIAL && 
                      t.NUMLCTO === title.NUMLCTO && 
                      t.ANOBASE === title.ANOBASE;
              } else {
                return String(t.NUMNOTA) === String(title.NUMNOTA) && 
                      String(t.PES_CODIGO) === String(title.PES_CODIGO) &&
                      t.DTEMISSAO === title.DTEMISSAO;
              }
            });
            
            if (existingIndex === -1) {
              newTitles.push(title);
            }
          });
          
          return newTitles;
        }
      });
      
      if (page === 1) {
        if (!uniqueStatuses.includes('VENCIDO')) {
          uniqueStatuses.push('VENCIDO');
        }
        setAvailableStatuses(['all', ...uniqueStatuses]);
      }
      
      return { titulos, count };
    } catch (error) {
      console.error(`Erro ao carregar página ${page} de títulos:`, error);
      return { titulos: [], count: 0 };
    } finally {
      setIsLoadingMore(false);
    }
  }, [dateRange, pageSize, updateTotalCount]);

  const loadRemainingPages = useCallback(async () => {
    try {
      let currentPageToLoad = 2;
      
      while (hasMorePages) {
        const { count } = await loadTitulosPage(currentPageToLoad);
        
        if (!count || currentPageToLoad * pageSize >= count) {
          setHasMorePages(false);
          break;
        }
        
        currentPageToLoad++;
      }
    } catch (error) {
      console.error("Erro ao carregar páginas adicionais:", error);
      setHasMorePages(false);
    }
  }, [hasMorePages, loadTitulosPage, pageSize]);

  const updateDateRange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
    setAllTitles([]);
    setHasMorePages(true);
    pagination.goToPage(1);
  }, [pagination]);

  useEffect(() => {
    if (!isLoading && !isLoadingMore && allTitles.length > 0) {
      setFinancialTitles(allTitles);
    }
  }, [allTitles, isLoading, isLoadingMore]);

  return {
    isLoading,
    isLoadingMore,
    hasMorePages,
    consolidatedInvoices,
    financialTitles,
    availableStatuses,
    dateRange,
    updateDateRange,
    refreshData,
    pagination,
    allTitles
  };
};
