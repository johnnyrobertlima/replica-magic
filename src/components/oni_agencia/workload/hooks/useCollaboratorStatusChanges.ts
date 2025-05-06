
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

// Type for user profile data structure
interface UserProfile {
  full_name: string | null;
  email: string | null;
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
        // Without using the join syntax that's causing issues
        const { data, error: fetchError } = await supabase
          .from('oni_agencia_schedule_history')
          .select(`
            id,
            field_name,
            old_value,
            new_value,
            created_at,
            schedule_id,
            changed_by
          `)
          .in('field_name', ['status_id', 'collaborator_id'])
          .order('created_at', { ascending: false })
          .limit(100);

        if (fetchError) {
          throw fetchError;
        }

        // Get unique user IDs to fetch user profiles
        const userIds = new Set<string>();
        data.forEach(item => {
          if (item.changed_by) userIds.add(item.changed_by);
        });

        // Fetch user profiles separately
        const userProfileMap: Record<string, UserProfile> = {};
        if (userIds.size > 0) {
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('id, full_name, email')
            .in('id', Array.from(userIds));

          if (profiles) {
            profiles.forEach(profile => {
              userProfileMap[profile.id] = {
                full_name: profile.full_name,
                email: profile.email
              };
            });
          }
        }

        // Get schedule IDs to fetch related data
        const scheduleIds = new Set(data.map(item => item.schedule_id));
        const scheduleMap: Record<string, any> = {};

        // Fetch schedules information
        if (scheduleIds.size > 0) {
          const { data: schedulesData, error: schedulesError } = await supabase
            .from('oni_agencia_content_schedules')
            .select(`
              id, 
              title, 
              collaborator_id,
              scheduled_date,
              client_id,
              oni_agencia_collaborators:collaborator_id (name),
              oni_agencia_clients:client_id (name)
            `)
            .in('id', Array.from(scheduleIds));

          if (schedulesError) {
            throw schedulesError;
          }

          if (schedulesData) {
            schedulesData.forEach(schedule => {
              scheduleMap[schedule.id] = schedule;
            });
          }
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
          const schedule = scheduleMap[item.schedule_id];
          
          // Get user profile info
          const userProfile = item.changed_by ? userProfileMap[item.changed_by] : null;
          const changedByName = userProfile?.full_name || userProfile?.email || 'Sistema';
          
          return {
            collaborator_name: schedule?.oni_agencia_collaborators?.name || 'Sem colaborador',
            schedule_title: schedule?.title || 'Sem título',
            old_status: isStatusChange 
              ? (item.old_value ? statusMap[item.old_value] || 'Desconhecido' : '') 
              : (item.old_value ? collaboratorMap[item.old_value] || 'Desconhecido' : ''),
            new_status: isStatusChange 
              ? (statusMap[item.new_value] || 'Desconhecido') 
              : (collaboratorMap[item.new_value] || 'Desconhecido'),
            changed_at: item.created_at,
            scheduled_date: schedule?.scheduled_date || '',
            schedule_id: item.schedule_id,
            previous_collaborator_name: item.field_name === 'collaborator_id' && item.old_value 
              ? collaboratorMap[item.old_value] || 'Desconhecido'
              : null,
            client_name: schedule?.oni_agencia_clients?.name || 'Cliente desconhecido',
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
