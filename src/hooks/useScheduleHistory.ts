
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleHistory {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  changed_by: string | null;
  created_at: string;
  changed_by_name?: string;
}

// Type for user profile data structure
interface UserProfile {
  full_name: string | null;
  email: string | null;
}

export function useScheduleHistory(scheduleId: string) {
  return useQuery({
    queryKey: ['scheduleHistory', scheduleId],
    queryFn: async () => {
      // Fetch history entries with correct join syntax for user profiles
      const { data: historyData, error: historyError } = await supabase
        .from('oni_agencia_schedule_history')
        .select(`
          id,
          field_name,
          old_value,
          new_value,
          changed_by,
          created_at,
          user_profiles(full_name, email)
        `)
        .eq('schedule_id', scheduleId)
        .order('created_at', { ascending: false });

      if (historyError) {
        console.error("Error fetching history:", historyError);
        throw historyError;
      }
      
      // Fetch status and collaborator information for resolving IDs to names
      const statusIds = new Set<string>();
      const collaboratorIds = new Set<string>();
      
      historyData.forEach(entry => {
        if (entry.field_name === 'status_id') {
          if (entry.old_value) statusIds.add(entry.old_value);
          if (entry.new_value) statusIds.add(entry.new_value);
        } else if (entry.field_name === 'collaborator_id') {
          if (entry.old_value) collaboratorIds.add(entry.old_value);
          if (entry.new_value) collaboratorIds.add(entry.new_value);
        }
      });
      
      // Convert to arrays safely for the IN query
      const statusIdsArray = Array.from(statusIds);
      const collaboratorIdsArray = Array.from(collaboratorIds);
      
      // Fetch status names
      const statusMap: Record<string, string> = {};
      if (statusIdsArray.length > 0) {
        const { data: statuses } = await supabase
          .from('oni_agencia_status')
          .select('id, name')
          .in('id', statusIdsArray);
          
        if (statuses) {
          statuses.forEach(status => {
            statusMap[status.id] = status.name;
          });
        }
      }
      
      // Fetch collaborator names
      const collaboratorMap: Record<string, string> = {};
      if (collaboratorIdsArray.length > 0) {
        const { data: collaborators } = await supabase
          .from('oni_agencia_collaborators')
          .select('id, name')
          .in('id', collaboratorIdsArray);
          
        if (collaborators) {
          collaborators.forEach(collab => {
            collaboratorMap[collab.id] = collab.name;
          });
        }
      }
      
      // Map and enhance history entries with resolved names
      const enhancedHistory = historyData.map(entry => {
        // Extract user profile data safely - the user_profiles returns an array
        const userProfiles = entry.user_profiles;
        let userProfile: UserProfile | null = null;
        
        if (Array.isArray(userProfiles) && userProfiles.length > 0) {
          userProfile = userProfiles[0];
        }
        
        const formattedEntry: ScheduleHistory = {
          id: entry.id,
          field_name: entry.field_name === 'status_id' ? 'Status' : 
                      entry.field_name === 'collaborator_id' ? 'Colaborador Responsável' :
                      entry.field_name === 'creation' ? 'Criação do Registro' : entry.field_name,
          old_value: null,
          new_value: '',
          changed_by: entry.changed_by,
          created_at: entry.created_at,
          changed_by_name: userProfile?.full_name || userProfile?.email || 'Sistema'
        };
        
        // Resolve values to human-readable names based on field type
        if (entry.field_name === 'status_id') {
          formattedEntry.old_value = entry.old_value ? statusMap[entry.old_value] || 'Desconhecido' : null;
          formattedEntry.new_value = statusMap[entry.new_value] || 'Desconhecido';
        } else if (entry.field_name === 'collaborator_id') {
          formattedEntry.old_value = entry.old_value ? collaboratorMap[entry.old_value] || 'Desconhecido' : null;
          formattedEntry.new_value = collaboratorMap[entry.new_value] || 'Desconhecido';
        } else if (entry.field_name === 'creation') {
          formattedEntry.new_value = 'Agendamento criado';
        }
        
        return formattedEntry;
      });
      
      return enhancedHistory;
    },
    enabled: !!scheduleId
  });
}
