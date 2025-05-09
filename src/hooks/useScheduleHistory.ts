
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
  return useQuery({
    queryKey: ['scheduleHistory', scheduleId],
    queryFn: async (): Promise<HistoryEntry[]> => {
      // Only proceed if we have a valid scheduleId
      if (!scheduleId) return [];
      
      try {
        // Fetch the history entries
        const { data: historyEntries, error } = await supabase
          .from('oni_agencia_schedule_history')
          .select(`
            id,
            schedule_id,
            field_name,
            old_value,
            new_value,
            created_at,
            changed_by,
            user_profiles(full_name, email)
          `)
          .eq('schedule_id', scheduleId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching schedule history:", error);
          throw error;
        }
        
        // Transform the data to include the user's name
        return historyEntries.map(entry => {
          // Extract user_profiles data safely, handling the array structure
          const userProfile = entry.user_profiles && Array.isArray(entry.user_profiles) && entry.user_profiles.length > 0
            ? entry.user_profiles[0]
            : null;

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
}
