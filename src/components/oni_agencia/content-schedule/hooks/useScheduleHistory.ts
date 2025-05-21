
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HistoryEntry {
  id: string;
  schedule_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  changed_by: string;
  changed_by_name: string;
  created_at: string;
}

export function useScheduleHistory(scheduleId: string) {
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['scheduleHistory', scheduleId],
    queryFn: async (): Promise<HistoryEntry[]> => {
      // Usando o hook importado de hooks/useScheduleHistory.ts
      if (!scheduleId) return [];
      
      try {
        // Fetch the history entries
        const { data: rawHistoryEntries, error } = await supabase
          .from('oni_agencia_schedule_history')
          .select(`
            id,
            schedule_id,
            field_name,
            old_value,
            new_value,
            created_at,
            changed_by
          `)
          .eq('schedule_id', scheduleId)
          .order('created_at', { ascending: false });

        const historyEntries = Array.isArray(rawHistoryEntries) ? rawHistoryEntries : [];
          
        if (error) {
          console.error("Error fetching schedule history:", error);
          throw error;
        }
        
        // Once we have the history entries, fetch the user profiles in a separate query
        // Create a list of unique user IDs
        const userIds = Array.from(new Set(historyEntries.filter(entry => entry.changed_by).map(entry => entry.changed_by)));
        
        let userProfiles: Record<string, { full_name?: string; email?: string }> = {};
        
        // Only fetch user profiles if we have user IDs
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name, email')
            .in('id', userIds);

          if (profilesError) {
            console.error("Error fetching user profiles:", profilesError);
          } else if (Array.isArray(profiles)) {
            // Create a map of user IDs to profiles
            userProfiles = profiles.reduce((acc, profile) => {
              acc[profile.id] = { full_name: profile.full_name, email: profile.email };
              return acc;
            }, {} as Record<string, { full_name?: string; email?: string }>);
          }
        }
        
        // Transform the data to include the user's name
        return historyEntries.map(entry => {
          const userProfile = entry.changed_by ? userProfiles[entry.changed_by] : null;
          
          return {
            id: entry.id,
            schedule_id: entry.schedule_id,
            field_name: entry.field_name,
            old_value: entry.old_value,
            new_value: entry.new_value,
            changed_by: entry.changed_by,
            changed_by_name: userProfile?.full_name || userProfile?.email || 'Sistema',
            created_at: entry.created_at
          };
        });
        
      } catch (error) {
        console.error("Error in useScheduleHistory:", error);
        throw error;
      }
    },
    enabled: !!scheduleId, // Only run the query if scheduleId is provided
  });

  return { history: history || [], isLoadingHistory };
}
