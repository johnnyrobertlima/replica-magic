
import { useQuery } from "@tanstack/react-query";
import { getContentSchedules, getAllContentSchedules } from "@/services/oniAgenciaContentScheduleServices";
import { useState } from "react";
import { CalendarEvent } from "@/types/oni-agencia";

// Cache time constants
const MINUTE = 60 * 1000;
const CACHE_TIME = 120 * MINUTE; // Aumentado para 2 horas
const STALE_TIME = 30 * MINUTE;  // Aumentado para 30 minutos
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
  
  // Determinar se é uma consulta para todos os clientes ou para um cliente específico
  const isAllClients = !clientId || clientId === "";
  
  // Consulta paginada com suporte a cache eficiente
  const result = useQuery({
    queryKey: ['optimizedContentSchedules', isAllClients ? 'all' : clientId, year, month, page],
    queryFn: async () => {
      try {
        // Selecionar a função apropriada com base no clientId
        const fetchFunction = isAllClients 
          ? getAllContentSchedules 
          : getContentSchedules;
        
        let data: CalendarEvent[];
        
        // Parâmetros para a função de consulta
        const params = isAllClients 
          ? [year, month, page, PAGE_SIZE] 
          : [clientId as string, year, month, page, PAGE_SIZE];
        
        // @ts-ignore - Os parâmetros são dinâmicos
        data = await fetchFunction(...params);
        
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
    retry: 1,
    retryDelay: attempt => Math.min(attempt * 1000, 3000),
    refetchInterval: false,
  });
  
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
