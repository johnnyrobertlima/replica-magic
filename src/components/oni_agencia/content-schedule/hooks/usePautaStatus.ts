
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";

// Type definition for client scope
interface ClientScope {
  id: string;
  client_id: string;
  service_id: string;
  quantity: number;
  service_name: string;
}

/**
 * Custom hook to check the status of client pauta (content schedule)
 * based on service scopes and calendar events
 */
export function usePautaStatus(clientId: string, month: number, year: number, events: CalendarEvent[]) {
  // Query to get client scopes
  const { data: rawClientScopes = [], error } = useQuery({
    queryKey: ['clientScopes', clientId, month, year],
    queryFn: async () => {
      let query = supabase
        .from('oni_agencia_client_scopes')
        .select('id, client_id, service_id, quantity, service:service_id(id, name)');
      
      // Only apply filtering if clientId is valid and not "all"
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
    // Enable the query only when we have a valid clientId (not "all")
    enabled: clientId !== "all" && clientId !== "" && !!clientId,
  });

  // Process client scopes to have a consistent format
  const clientScopes = (rawClientScopes || []).map(scope => ({
    id: scope.id,
    client_id: scope.client_id,
    service_id: scope.service_id,
    quantity: scope.quantity,
    // Handle different possible shapes of the service data
    service_name: scope.service?.name || scope.service || ''
  })) as ClientScope[];

  // Return client scopes and any error that occurred
  return {
    clientScopes,
    error
  };
}

// Export the useClientScopes function to maintain backward compatibility
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
