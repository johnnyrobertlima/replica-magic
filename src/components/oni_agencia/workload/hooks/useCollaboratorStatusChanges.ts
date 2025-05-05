
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StatusChange {
  collaborator_name: string;
  schedule_title: string;
  old_status: string;
  new_status: string;
  changed_at: string;
}

export function useCollaboratorStatusChanges() {
  const [statusChanges, setStatusChanges] = useState<StatusChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchStatusChanges() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch status changes from oni_agencia_schedule_history table
        const { data, error: fetchError } = await supabase
          .from('oni_agencia_schedule_history')
          .select(`
            id,
            field_name,
            old_value,
            new_value,
            created_at,
            schedule_id,
            oni_agencia_content_schedules:schedule_id (
              title, 
              collaborator_id,
              oni_agencia_collaborators:collaborator_id (name)
            )
          `)
          .eq('field_name', 'status_id')
          .order('created_at', { ascending: false })
          .limit(50);

        if (fetchError) {
          throw fetchError;
        }

        // Get status names
        const statusIds = new Set([
          ...data.map(item => item.old_value).filter(Boolean),
          ...data.map(item => item.new_value).filter(Boolean)
        ]);

        const { data: statusData, error: statusError } = await supabase
          .from('oni_agencia_status')
          .select('id, name')
          .in('id', Array.from(statusIds));

        if (statusError) {
          throw statusError;
        }

        // Create a map of status IDs to names
        const statusMap = statusData.reduce((acc, status) => {
          acc[status.id] = status.name;
          return acc;
        }, {} as Record<string, string>);

        // Transform data for the grid
        const formattedChanges: StatusChange[] = data.map(item => ({
          collaborator_name: item.oni_agencia_content_schedules?.oni_agencia_collaborators?.name || 'Sem colaborador',
          schedule_title: item.oni_agencia_content_schedules?.title || 'Sem título',
          old_status: item.old_value ? statusMap[item.old_value] || 'Desconhecido' : '',
          new_status: statusMap[item.new_value] || 'Desconhecido',
          changed_at: item.created_at,
        }));

        setStatusChanges(formattedChanges);
      } catch (err) {
        console.error('Error fetching collaborator status changes:', err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido ao carregar alterações de status'));
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar o histórico de status dos colaboradores",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatusChanges();
  }, [toast]);

  return { statusChanges, isLoading, error };
}
