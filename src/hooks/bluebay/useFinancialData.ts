
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

  // Use o hook de paginação
  const pagination = usePagination(1000);
  const { currentPage, pageSize, updateTotalCount } = pagination;

  // Armazenar todos os títulos, não apenas a página atual
  const [allTitles, setAllTitles] = useState<FinancialTitle[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(true);

  // Carregar dados iniciais
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setAllTitles([]);
    setHasMorePages(true);
    
    try {
      console.info("Iniciando refreshData - buscando dados financeiros");
      
      // Primeiro buscar apenas a primeira página para mostrar dados rapidamente
      await loadTitulosPage(1);
      
      // Buscar dados de faturamento enquanto o usuário já pode ver a primeira página
      const faturamento = await fetchFaturamento(dateRange);
      
      // Depois processar e mostrar os dados de faturamento
      if (allTitles.length > 0) {
        const { clientesMap } = await processTitles(allTitles);
        const consolidatedData = processInvoices(faturamento, clientesMap, allTitles);
        setConsolidatedInvoices(consolidatedData);
      }
      
      // Carregar as páginas restantes em segundo plano
      loadRemainingPages();
      
    } catch (error) {
      console.error("Erro geral ao buscar dados financeiros:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  // Função para carregar uma página específica de títulos
  const loadTitulosPage = useCallback(async (page: number) => {
    try {
      setIsLoadingMore(true);
      
      // Buscar títulos da página especificada
      const { data: titulos, count } = await fetchTitulos(dateRange, page, pageSize);
      
      // Buscar também títulos com data nula, apenas na primeira página
      let titulosComDataNula: FinancialTitle[] = [];
      if (page === 1) {
        titulosComDataNula = await fetchTitulosComDataNula();
      }
      
      // Combinar títulos regulares com títulos de data nula
      const todosTitulos = [...titulos, ...titulosComDataNula];
      
      // Atualizar contagem total e verificar se há mais páginas
      if (count !== null) {
        updateTotalCount(count);
        setHasMorePages(page * pageSize < count);
      }
      
      // Processar títulos para extrair informações necessárias
      const { processedTitles, uniqueStatuses } = await processTitles(todosTitulos);
      
      // Atualizar o estado com os títulos processados
      setAllTitles(prev => {
        // Filtrar duplicatas ao mesclar arrays
        const newTitles = [...prev];
        processedTitles.forEach(title => {
          // Verifique se os campos necessários existem antes de usá-los
          const existingIndex = newTitles.findIndex(t => {
            // Se algum dos campos primários estiver ausente, use outros campos para comparação
            if (title.MATRIZ && t.MATRIZ && 
                title.FILIAL && t.FILIAL && 
                title.NUMLCTO && t.NUMLCTO && 
                title.ANOBASE && t.ANOBASE) {
              return t.MATRIZ === title.MATRIZ && 
                     t.FILIAL === title.FILIAL && 
                     t.NUMLCTO === title.NUMLCTO && 
                     t.ANOBASE === title.ANOBASE;
            } else {
              // Fallback para outra forma de comparação se os campos primários não estiverem disponíveis
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
      
      // Atualizar financialTitles com todos os títulos coletados
      setFinancialTitles(prev => {
        if (page === 1) {
          return processedTitles; // Substituir completamente na primeira página
        } else {
          // Mesclar evitando duplicatas nas outras páginas
          const newTitles = [...prev];
          processedTitles.forEach(title => {
            // Verifique os campos primários antes de usá-los
            const existingIndex = newTitles.findIndex(t => {
              // Se algum dos campos primários estiver ausente, use outros campos para comparação
              if (title.MATRIZ && t.MATRIZ && 
                  title.FILIAL && t.FILIAL && 
                  title.NUMLCTO && t.NUMLCTO && 
                  title.ANOBASE && t.ANOBASE) {
                return t.MATRIZ === title.MATRIZ && 
                      t.FILIAL === title.FILIAL && 
                      t.NUMLCTO === title.NUMLCTO && 
                      t.ANOBASE === title.ANOBASE;
              } else {
                // Fallback para outra forma de comparação
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
      
      // Atualizar lista de status disponíveis apenas na primeira página
      if (page === 1) {
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

  // Função para carregar todas as páginas restantes em segundo plano
  const loadRemainingPages = useCallback(async () => {
    try {
      let currentPageToLoad = 2;
      
      while (hasMorePages) {
        const { count } = await loadTitulosPage(currentPageToLoad);
        
        // Verificar se chegamos ao fim
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
    // Resetar estado da paginação quando o intervalo de datas muda
    setAllTitles([]);
    setHasMorePages(true);
    pagination.goToPage(1);
  }, [pagination]);

  // Efeito para mostrar todos os títulos quando carregamento completo
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
