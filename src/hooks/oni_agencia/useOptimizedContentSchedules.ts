
import { useQuery } from "@tanstack/react-query";
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

/**
 * Hook otimizado para buscar agendamentos de conteúdo com paginação
 */
export function useOptimizedContentSchedules(
  clientId: string | null,
  year: number,
  month: number,
  page: number = 1
) {
  const [totalItems, setTotalItems] = useState(0);
  const [allItems, setAllItems] = useState<CalendarEvent[]>([]);
  const { toast } = useToast();
  
  // Determinar se é uma consulta para todos os clientes ou para um cliente específico
  const isAllClients = !clientId || clientId === "";
  
  // Consulta paginada com suporte a cache eficiente
  const result = useQuery({
    queryKey: ['optimizedContentSchedules', isAllClients ? 'all' : clientId, year, month, page],
    queryFn: async () => {
      try {
        // Selecionar a função apropriada com base no clientId
        const fetchFunction = isAllClients 
          ? getAllContentSchedulesPaginated 
          : getContentSchedulesPaginated;
        
        let data: CalendarEvent[];
        
        // Parâmetros para a função de consulta
        const params = isAllClients 
          ? [year, month, page, PAGE_SIZE] 
          : [clientId as string, year, month, page, PAGE_SIZE];
        
        // @ts-ignore - Os parâmetros são dinâmicos
        data = await fetchFunction(...params);
        
        // Verificar se data é um array válido
        if (!data || !Array.isArray(data)) {
          console.error('Resposta inválida da API:', data);
          return {
            data: [],
            page,
            hasMore: false,
            totalItems: 0
          };
        }
        
        // Atualizar o estado com os dados recebidos
        if (page === 1) {
          setAllItems(data);
        } else {
          setAllItems(prev => [...prev, ...data]);
        }
        
        // Atualizar o total de itens (se disponível na resposta)
        if (data.length < PAGE_SIZE) {
          setTotalItems((page - 1) * PAGE_SIZE + data.length);
        } else {
          setTotalItems(page * PAGE_SIZE + 1); // Indica que há mais páginas
        }
        
        return {
          data,
          page,
          hasMore: data.length === PAGE_SIZE,
          totalItems: totalItems
        };
      } catch (error) {
        console.error('Error in useOptimizedContentSchedules:', error);
        throw error;
      }
    },
    enabled: !!year && !!month,
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
    if (result.data?.hasMore && !result.isFetching) {
      return page + 1;
    }
    return page;
  };
  
  return {
    ...result,
    allItems,
    totalItems,
    hasMore: result.data?.hasMore || false,
    loadMore,
    isLoadingMore: result.isFetching && page > 1,
  };
}
