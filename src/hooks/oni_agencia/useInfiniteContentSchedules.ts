
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

// Cache time constants
const MINUTE = 60 * 1000;
const CACHE_TIME = 10 * MINUTE; // 10 minutos
const STALE_TIME = 5 * MINUTE;  // 5 minutos
const PAGE_SIZE = 100; // Increased page size for better performance

export function useInfiniteContentSchedules(
  clientId: string | null,
  year: number,
  month: number,
  collaboratorId: string | null = null,
  autoFetchAllPages: boolean = true // New parameter to control auto-fetching behavior
) {
  const { toast } = useToast();

  const infiniteQuery = useInfiniteQuery({
    queryKey: ['infiniteContentSchedules', clientId, year, month, collaboratorId],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        console.log(`Fetching page ${pageParam} of content schedules for ${year}-${month}`);
        
        // Use the RPC function which now returns all events for the month
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

        // Safety check - ensure data is an array
        const safeData = Array.isArray(data) ? data : [];
        
        // Create timestamps for now to use as fallback
        const now = new Date().toISOString();
        
        // Process data to ensure it includes created_at and updated_at
        const processedData = safeData.map(item => {
          // Map the data from the RPC function to our CalendarEvent type
          return {
            id: item.id || '',
            client_id: item.client_id || '',
            service_id: item.service_id || '',
            collaborator_id: item.collaborator_id || null,
            title: item.title || null,
            description: item.description || null,
            scheduled_date: item.scheduled_date || '',
            execution_phase: item.execution_phase || null,
            editorial_line_id: item.editorial_line_id || null,
            product_id: item.product_id || null,
            status_id: item.status_id || null,
            creators: item.creators || null,
            created_at: (item as any).created_at || now, // Type assertion to avoid TS error
            updated_at: (item as any).updated_at || now, // Type assertion to avoid TS error
            // Add nested objects if available
            service: item.service_name ? {
              id: item.service_id || '',
              name: item.service_name || '',
              category: item.service_category || null,
              color: item.service_color || null
            } : null,
            collaborator: item.collaborator_name ? {
              id: item.collaborator_id || '',
              name: item.collaborator_name || '',
              email: null,
              photo_url: null
            } : null,
            editorial_line: item.editorial_line_name ? {
              id: item.editorial_line_id || '',
              name: item.editorial_line_name || '',
              symbol: item.editorial_line_symbol || null,
              color: item.editorial_line_color || null
            } : null,
            product: item.product_name ? {
              id: item.product_id || '',
              name: item.product_name || '',
              symbol: item.product_symbol || null,
              color: item.product_color || null
            } : null,
            status: item.status_name ? {
              id: item.status_id || '',
              name: item.status_name || '',
              color: item.status_color || null
            } : null,
            client: item.client_name ? {
              id: item.client_id || '',
              name: item.client_name || ''
            } : null
          } as CalendarEvent;
        });

        // Determine if there are more pages
        const hasMorePages = processedData.length >= PAGE_SIZE;
        console.log(`Fetched ${processedData.length} events for page ${pageParam}. Has more: ${hasMorePages}`);

        return {
          data: processedData,
          nextPage: hasMorePages ? pageParam + 1 : undefined,
          totalCount: processedData.length,
          isLastPage: !hasMorePages
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

  // Auto-fetch all pages when requested
  useEffect(() => {
    if (autoFetchAllPages && 
        infiniteQuery.hasNextPage && 
        !infiniteQuery.isFetchingNextPage && 
        !infiniteQuery.isLoading && 
        infiniteQuery.data) {
      console.log("Auto-fetching next page of content schedules");
      infiniteQuery.fetchNextPage();
    }
  }, [
    autoFetchAllPages,
    infiniteQuery.hasNextPage,
    infiniteQuery.isFetchingNextPage,
    infiniteQuery.isLoading,
    infiniteQuery.data,
    infiniteQuery.fetchNextPage
  ]);

  return infiniteQuery;
}
