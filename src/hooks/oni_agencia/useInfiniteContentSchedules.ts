
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";

// Cache time constants
const MINUTE = 60 * 1000;
const CACHE_TIME = 10 * MINUTE; // 10 minutos
const STALE_TIME = 5 * MINUTE;  // 5 minutos
const PAGE_SIZE = 50;

export function useInfiniteContentSchedules(
  clientId: string | null,
  year: number,
  month: number,
  collaboratorId: string | null = null
) {
  const { toast } = useToast();

  return useInfiniteQuery({
    queryKey: ['infiniteContentSchedules', clientId, year, month, collaboratorId],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        // Usar a função RPC otimizada
        const { data, error, count } = await supabase
          .rpc('get_paginated_schedules', {
            p_client_id: clientId,
            p_year: year,
            p_month: month,
            p_collaborator_id: collaboratorId,
            p_limit: PAGE_SIZE,
            p_offset: pageParam * PAGE_SIZE
          })
          .returns<CalendarEvent[]>();

        if (error) {
          console.error('Error fetching content schedules:', error);
          throw error;
        }

        return {
          data: data || [],
          nextPage: (data?.length || 0) >= PAGE_SIZE ? pageParam + 1 : undefined,
          totalCount: count
        };
      } catch (error) {
        console.error('Error in useInfiniteContentSchedules:', error);
        throw error;
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: attempt => Math.min(attempt * 1000, 3000),
    initialPageParam: 0,
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
}
