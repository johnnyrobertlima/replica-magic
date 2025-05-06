
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
      // Fetch history entries with join to user_profiles for changed_by name
      const { data: historyData, error: historyError } = await supabase
        .from('oni_agencia_schedule_history')
        .select(`
          id,
          field_name,
          old_value,
          new_value,
          changed_by,
          created_at,
          user_profiles!changed_by(full_name, email)
        `)
        .eq('schedule_id', scheduleId)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;
      
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
      
      // Fetch status names
      const statusMap: Record<string, string> = {};
      if (statusIds.size > 0) {
        const { data: statuses } = await supabase
          .from('oni_agencia_status')
          .select('id, name')
          .in('id', Array.from(statusIds));
          
        if (statuses) {
          statuses.forEach(status => {
            statusMap[status.id] = status.name;
          });
        }
      }
      
      // Fetch collaborator names
      const collaboratorMap: Record<string, string> = {};
      if (collaboratorIds.size > 0) {
        const { data: collaborators } = await supabase
          .from('oni_agencia_collaborators')
          .select('id, name')
          .in('id', Array.from(collaboratorIds));
          
        if (collaborators) {
          collaborators.forEach(collab => {
            collaboratorMap[collab.id] = collab.name;
          });
        }
      }
      
      // Map and enhance history entries with resolved names
      const enhancedHistory = historyData.map(entry => {
        // Extract user profile data safely
        const userProfile = entry.user_profiles as UserProfile | null;
        
        const formattedEntry: ScheduleHistory = {
          id: entry.id,
          field_name: entry.field_name === 'status_id' ? 'Status' : 'Colaborador Responsável',
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
        }
        
        return formattedEntry;
      });
      
      return enhancedHistory;
    },
    enabled: !!scheduleId
  });
}
