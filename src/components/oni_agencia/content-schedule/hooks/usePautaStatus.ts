
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent, ClientScope } from "@/types/oni-agencia";
import { useToast } from "@/hooks/use-toast";

interface ClientScopeWithServiceName extends ClientScope {
  service_name: string;
}

export function usePautaStatus(
  clientId: string,
  month: number,
  year: number,
  events: CalendarEvent[]
) {
  const { toast } = useToast();
  
  // Fetch client scopes for this client
  const { data: clientScopes = [], error } = useQuery({
    queryKey: ['clientScopes', clientId, month, year],
    queryFn: async () => {
      console.log(`Fetching client scopes for client ${clientId}, month: ${month}, year: ${year}`);
      
      if (!clientId || clientId === "" || clientId === "all") {
        console.log("Invalid client ID, not fetching scopes");
        return [];
      }
      
      try {
        // Get scopes with service names for better display
        const { data, error } = await supabase
          .from('oni_agencia_client_scopes')
          .select(`
            id, 
            client_id, 
            service_id, 
            quantity,
            services:service_id (
              id,
              name
            )
          `)
          .eq('client_id', clientId);
        
        if (error) {
          console.error('Error fetching client scopes:', error);
          throw error;
        }
        
        // Transform the data to include service_name
        const transformedData = data?.map(scope => ({
          id: scope.id,
          client_id: scope.client_id,
          service_id: scope.service_id,
          quantity: scope.quantity,
          service_name: scope.services?.name || 'Unknown service'
        })) || [];
        
        console.log(`Found ${transformedData.length} scopes for client ${clientId}`);
        return transformedData;
      } catch (err) {
        console.error('Error in usePautaStatus:', err);
        toast({
          title: "Erro ao carregar escopo do cliente",
          description: "Não foi possível obter informações sobre o escopo do cliente.",
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!clientId && clientId !== "" && clientId !== "all",
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    clientScopes: clientScopes || [],
    error
  };
}
