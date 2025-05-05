
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StatusChange {
  collaborator_name: string;
  schedule_title: string;
  old_status: string;
  new_status: string;
  changed_at: string;
  scheduled_date: string; // Added field for the scheduled date
  schedule_id: string; // Added field for the schedule ID to create the link
  previous_collaborator_name: string | null; // Added field for the previous collaborator
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
              scheduled_date,
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

        // Get additional collaborator info for changes in collaborator field
        const collaboratorChanges = data.filter(item => item.field_name === 'collaborator_id' && item.old_value);
        let previousCollaboratorsMap = {} as Record<string, string>;

        if (collaboratorChanges.length > 0) {
          const oldCollaboratorIds = collaboratorChanges
            .map(item => item.old_value)
            .filter(Boolean);

          if (oldCollaboratorIds.length > 0) {
            const { data: collaboratorsData } = await supabase
              .from('oni_agencia_collaborators')
              .select('id, name')
              .in('id', oldCollaboratorIds);

            if (collaboratorsData) {
              previousCollaboratorsMap = collaboratorsData.reduce((acc, collab) => {
                acc[collab.id] = collab.name;
                return acc;
              }, {} as Record<string, string>);
            }
          }
        }

        // Transform data for the grid
        const formattedChanges: StatusChange[] = data.map(item => ({
          collaborator_name: item.oni_agencia_content_schedules?.oni_agencia_collaborators?.name || 'Sem colaborador',
          schedule_title: item.oni_agencia_content_schedules?.title || 'Sem título',
          old_status: item.old_value ? statusMap[item.old_value] || 'Desconhecido' : '',
          new_status: statusMap[item.new_value] || 'Desconhecido',
          changed_at: item.created_at,
          scheduled_date: item.oni_agencia_content_schedules?.scheduled_date || '',
          schedule_id: item.schedule_id,
          previous_collaborator_name: item.field_name === 'collaborator_id' && item.old_value 
            ? previousCollaboratorsMap[item.old_value] || 'Desconhecido'
            : null
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
