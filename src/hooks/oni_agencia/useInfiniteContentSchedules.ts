
import { useInfiniteQuery } from "@tanstack/react-query";
import { 
  getAllContentSchedulesPaginated, 
  getContentSchedulesPaginated 
} from "@/services/oniAgenciaContentScheduleServices";
import { useState, useEffect } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";

// Cache time constants
const MINUTE = 60 * 1000;
const CACHE_TIME = 120 * MINUTE; // 2 horas
const STALE_TIME = 30 * MINUTE;  // 30 minutos
const PAGE_SIZE = 50; // Tamanho da página para paginação

// Define interfaces for better type safety
interface FetchPageResult {
  data: CalendarEvent[];
  page: number;
  hasMore: boolean;
  totalItems: number;
}

/**
 * Hook otimizado para buscar agendamentos de conteúdo com paginação
 */
export function useInfiniteContentSchedules(
  clientId: string | null,
  year: number | null = null, // Make optional
  month: number | null = null, // Make optional
  selectedCollaborator: string | null = null,
  autoFetch: boolean = false,
  serviceIds: string[] = []
) {
  const [totalItems, setTotalItems] = useState(0);
  const [allItems, setAllItems] = useState<CalendarEvent[]>([]);
  const { toast } = useToast();
  
  // Determinar se é uma consulta para todos os clientes ou para um cliente específico
  const isAllClients = !clientId || clientId === "";
  
  // Determine if we're doing a filtered query or loading all data
  const isFilteredQuery = !!year && !!month;
  
  // Consulta paginada com suporte a cache eficiente
  const result = useInfiniteQuery<FetchPageResult>({
    queryKey: [
      'optimizedContentSchedules', 
      isAllClients ? 'all' : clientId, 
      year || 'all', 
      month || 'all', 
      selectedCollaborator, 
      serviceIds.length > 0 ? serviceIds : 'all'
    ],
    queryFn: async ({ pageParam }) => {
      try {
        // Selecionar a função apropriada com base no clientId
        const fetchFunction = isAllClients 
          ? getAllContentSchedulesPaginated 
          : getContentSchedulesPaginated;
        
        let data: CalendarEvent[];
        const currentPage = pageParam as number;
        
        // Parâmetros para a função de consulta
        if (isFilteredQuery) {
          // If we have year and month filters, use them
          const params = isAllClients 
            ? [year!, month!, currentPage, PAGE_SIZE, selectedCollaborator, serviceIds] 
            : [clientId as string, year!, month!, currentPage, PAGE_SIZE, selectedCollaborator, serviceIds];
          
          // @ts-ignore - Os parâmetros são dinâmicos
          data = await fetchFunction(...params);
        } else {
          // If no filters, fetch all data - parameters change based on API requirements
          const params = isAllClients 
            ? [null, null, currentPage, PAGE_SIZE, selectedCollaborator, serviceIds] 
            : [clientId as string, null, null, currentPage, PAGE_SIZE, selectedCollaborator, serviceIds];
          
          // @ts-ignore - Os parâmetros são dinâmicos
          data = await fetchFunction(...params);
        }
        
        // Verificar se data é um array válido
        if (!data || !Array.isArray(data)) {
          console.error('Resposta inválida da API:', data);
          return {
            data: [],
            page: currentPage,
            hasMore: false,
            totalItems: 0
          };
        }
        
        // Atualizar o estado com os dados recebidos
        if (currentPage === 1) {
          setAllItems(data);
        } else {
          setAllItems(prev => [...prev, ...data]);
        }
        
        // Atualizar o total de itens (se disponível na resposta)
        if (data.length < PAGE_SIZE) {
          setTotalItems((currentPage - 1) * PAGE_SIZE + data.length);
        } else {
          setTotalItems(currentPage * PAGE_SIZE + 1); // Indica que há mais páginas
        }
        
        return {
          data,
          page: currentPage,
          hasMore: data.length === PAGE_SIZE,
          totalItems: totalItems
        };
      } catch (error) {
        console.error('Error in useInfiniteContentSchedules:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: autoFetch,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: attempt => Math.min(attempt * 1000, 3000),
    refetchInterval: false,
    meta: {
      errorHandler: (error: any) => {
        console.error('Erro ao carregar agendamentos:', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os agendamentos. Verifique sua conexão e tente novamente.",
          variant: "destructive",
        });
      }
    }
  });
  
  // Handle errors directly instead of trying to access result.meta
  useEffect(() => {
    if (result.error) {
      console.error('Erro ao carregar agendamentos:', result.error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os agendamentos. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
    }
  }, [result.error, toast]);
  
  // Funções auxiliares para manipulação de paginação
  const loadMore = () => {
    if (result.hasNextPage && !result.isFetching) {
      result.fetchNextPage();
    }
  };
  
  return {
    ...result,
    allItems,
    totalItems,
    hasMore: result.hasNextPage || false,
    loadMore,
    isLoadingMore: result.isFetchingNextPage && result.hasNextPage,
  };
}
