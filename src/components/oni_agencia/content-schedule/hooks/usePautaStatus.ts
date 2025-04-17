
import { useEffect, useState, useMemo } from "react";
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
  // Buscar os escopos do cliente com cache
  const { data: clientScopes = [] } = useQuery({
    queryKey: ['oniAgenciaClientScopes', clientId],
    queryFn: async () => {
      if (!clientId) return [];

      // Buscamos os escopos junto com os dados do serviço para evitar uma segunda consulta
      const { data, error } = await supabase
        .from('oni_agencia_client_scopes')
        .select(`
          id,
          client_id,
          service_id,
          quantity,
          service:service_id(id, name)
        `)
        .eq('client_id', clientId);

      if (error) {
        console.error('Error fetching client scopes:', error);
        throw error;
      }

      // Transformar os dados para o formato esperado
      return data.map(scope => ({
        id: scope.id,
        client_id: scope.client_id,
        service_id: scope.service_id,
        quantity: scope.quantity,
        service_name: scope.service?.name || 'Serviço desconhecido'
      })) as ClientScope[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    enabled: !!clientId,
  });

  // Calcular os escopos enriquecidos usando useMemo
  const enrichedScopes = useMemo(() => {
    return clientScopes.map(scope => ({
      service_id: scope.service_id,
      service_name: scope.service_name || 'Serviço desconhecido',
      quantity: scope.quantity
    }));
  }, [clientScopes]);

  return { clientScopes: enrichedScopes };
}
