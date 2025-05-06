
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StatusChange {
  collaborator_name: string;
  schedule_title: string;
  old_status: string;
  new_status: string;
  changed_at: string;
  scheduled_date: string;
  schedule_id: string;
  previous_collaborator_name: string | null;
  client_name: string;
  field_type: 'status' | 'collaborator';
  changed_by_name: string;
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

        // Fetch both status and collaborator changes from oni_agencia_schedule_history table
        // Now including user_profiles join to get the name of who made the change
        const { data, error: fetchError } = await supabase
          .from('oni_agencia_schedule_history')
          .select(`
            id,
            field_name,
            old_value,
            new_value,
            created_at,
            schedule_id,
            changed_by,
            user_profiles:changed_by (full_name, email),
            oni_agencia_content_schedules:schedule_id (
              title, 
              collaborator_id,
              scheduled_date,
              client_id,
              oni_agencia_collaborators:collaborator_id (name),
              oni_agencia_clients:client_id (name)
            )
          `)
          .in('field_name', ['status_id', 'collaborator_id'])
          .order('created_at', { ascending: false })
          .limit(100);

        if (fetchError) {
          throw fetchError;
        }

        // Get status names
        const statusIds = new Set([
          ...data.filter(item => item.field_name === 'status_id').map(item => item.old_value).filter(Boolean),
          ...data.filter(item => item.field_name === 'status_id').map(item => item.new_value).filter(Boolean)
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

        // Get collaborator names for both current and previous collaborators
        const collaboratorIds = new Set([
          ...data.filter(item => item.field_name === 'collaborator_id').map(item => item.old_value).filter(Boolean),
          ...data.filter(item => item.field_name === 'collaborator_id').map(item => item.new_value).filter(Boolean)
        ]);

        const { data: collaboratorsData, error: collaboratorsError } = await supabase
          .from('oni_agencia_collaborators')
          .select('id, name')
          .in('id', Array.from(collaboratorIds));

        if (collaboratorsError) {
          throw collaboratorsError;
        }

        // Create a map of collaborator IDs to names
        const collaboratorMap = collaboratorsData.reduce((acc, collab) => {
          acc[collab.id] = collab.name;
          return acc;
        }, {} as Record<string, string>);

        // Transform data for the grid
        const formattedChanges: StatusChange[] = data.map(item => {
          const isStatusChange = item.field_name === 'status_id';
          const changedByName = item.user_profiles?.full_name || 
                               item.user_profiles?.email || 
                               'Sistema';
          
          return {
            collaborator_name: item.oni_agencia_content_schedules?.oni_agencia_collaborators?.name || 'Sem colaborador',
            schedule_title: item.oni_agencia_content_schedules?.title || 'Sem título',
            old_status: isStatusChange 
              ? (item.old_value ? statusMap[item.old_value] || 'Desconhecido' : '') 
              : (item.old_value ? collaboratorMap[item.old_value] || 'Desconhecido' : ''),
            new_status: isStatusChange 
              ? (statusMap[item.new_value] || 'Desconhecido') 
              : (collaboratorMap[item.new_value] || 'Desconhecido'),
            changed_at: item.created_at,
            scheduled_date: item.oni_agencia_content_schedules?.scheduled_date || '',
            schedule_id: item.schedule_id,
            previous_collaborator_name: item.field_name === 'collaborator_id' && item.old_value 
              ? collaboratorMap[item.old_value] || 'Desconhecido'
              : null,
            client_name: item.oni_agencia_content_schedules?.oni_agencia_clients?.name || 'Cliente desconhecido',
            field_type: isStatusChange ? 'status' : 'collaborator',
            changed_by_name: changedByName
          };
        });

        setStatusChanges(formattedChanges);
      } catch (err) {
        console.error('Error fetching changes:', err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido ao carregar alterações'));
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar o histórico de alterações",
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
