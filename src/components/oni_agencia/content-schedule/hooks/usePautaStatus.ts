
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarEvent } from "@/types/oni-agencia";
import { supabase } from "@/integrations/supabase/client";

type ClientScope = {
  id: string;
  client_id: string;
  service_id: string;
  quantity: number;
  service_name?: string;
};

export function usePautaStatus(clientId: string, month: number, year: number, events: CalendarEvent[]) {
  const [enrichedScopes, setEnrichedScopes] = useState<{
    service_id: string;
    service_name: string;
    quantity: number;
  }[]>([]);

  // Fetch client scopes
  const { data: clientScopes = [] } = useQuery({
    queryKey: ['oniAgenciaClientScopes', clientId],
    queryFn: async () => {
      console.log('Fetching client scopes:', clientId);
      if (!clientId) return [];

      const { data, error } = await supabase
        .from('oni_agencia_client_scopes')
        .select(`
          id,
          client_id,
          service_id,
          quantity
        `)
        .eq('client_id', clientId);

      if (error) {
        console.error('Error fetching client scopes:', error);
        throw error;
      }

      return data as ClientScope[];
    },
    enabled: !!clientId,
  });

  // Fetch service details for all the scopes
  useEffect(() => {
    if (clientScopes.length > 0) {
      const serviceIds = clientScopes.map(scope => scope.service_id);
      
      const fetchServiceDetails = async () => {
        const { data, error } = await supabase
          .from('oni_agencia_services')
          .select('id, name')
          .in('id', serviceIds);

        if (error) {
          console.error('Error fetching service details:', error);
          return;
        }

        // Map the service names to the client scopes
        const enriched = clientScopes.map(scope => {
          const service = data.find(s => s.id === scope.service_id);
          return {
            service_id: scope.service_id,
            service_name: service ? service.name : 'Unknown Service',
            quantity: scope.quantity
          };
        });

        setEnrichedScopes(enriched);
      };

      fetchServiceDetails();
    }
  }, [clientScopes]);

  return { clientScopes: enrichedScopes };
}
