
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";
import { 
  getContentSchedules, 
  getAllContentSchedules 
} from "@/services/oniAgenciaContentScheduleServices";

// Function to get content schedules for a specific client
export function useContentSchedules(clientId: string | null, year: number, month: number) {
  return useQuery({
    queryKey: ['contentSchedules', clientId, year, month],
    queryFn: () => getContentSchedules(clientId, year, month),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Function to get all content schedules regardless of client
export function useAllContentSchedules(year: number, month: number) {
  return useQuery({
    queryKey: ['allContentSchedules', year, month],
    queryFn: () => getAllContentSchedules(year, month),
    staleTime: 60 * 1000, // 1 minute
  });
}

// Function to get client scopes
export function useClientScopes(clientId: string | null) {
  return useQuery({
    queryKey: ['clientScopes', clientId],
    queryFn: async () => {
      // Don't use "eq.all" - this is causing the error
      // Instead, if clientId is null or "all", don't add the client filter
      let query = supabase
        .from('oni_agencia_client_scopes')
        .select('id, client_id, service_id, quantity, service:service_id(id, name)');
        
      if (clientId && clientId !== "all") {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching client scopes:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 300 * 1000, // 5 minutes
    enabled: !!clientId, // Only run if clientId is provided
  });
}
