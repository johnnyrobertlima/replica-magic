
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
        const { data, error } = await supabase
          .rpc('get_paginated_schedules', {
            p_client_id: clientId,
            p_year: year,
            p_month: month,
            p_collaborator_id: collaboratorId,
            p_limit: PAGE_SIZE,
            p_offset: pageParam * PAGE_SIZE
          });

        if (error) {
          console.error('Error fetching content schedules:', error);
          throw error;
        }

        // Verificar se o resultado é um array (tratando possíveis erros de tipo)
        const safeData = Array.isArray(data) ? data : [];
        
        // Process data to ensure it includes created_at and updated_at
        const processedData = safeData.map(item => {
          // Create a timestamp for now to use as fallback
          const now = new Date().toISOString();
          
          return {
            ...item,
            // Ensure these fields are always present
            created_at: item.created_at || now,
            updated_at: item.updated_at || now
          };
        }) as CalendarEvent[];

        return {
          data: processedData,
          nextPage: processedData.length >= PAGE_SIZE ? pageParam + 1 : undefined,
          totalCount: processedData.length
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
