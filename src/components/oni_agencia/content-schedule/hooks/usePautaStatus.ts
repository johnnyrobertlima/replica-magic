
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useClientScopes(clientId: string | null) {
  return useQuery({
    queryKey: ['clientScopes', clientId],
    queryFn: async () => {
      let query = supabase
        .from('oni_agencia_client_scopes')
        .select('id, client_id, service_id, quantity, service:service_id(id, name)');
      
      // Only apply filtering if clientId is a valid UUID
      if (clientId && clientId !== "all" && clientId !== "") {
        query = query.eq('client_id', clientId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching client scopes:', error);
        throw error;
      }
      
      return data || [];
    },
    // Only run if clientId is not "all"
    enabled: clientId !== "all" && clientId !== "",
  });
}
