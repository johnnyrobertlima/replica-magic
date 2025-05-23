
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface HistoryEntry {
  id: string;
  schedule_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  changed_by_name?: string | null;
  created_at: string;
}

export function useScheduleHistory(scheduleId: string) {
  const queryClient = useQueryClient();

  // Set up cache invalidation
  useEffect(() => {
    // Function to handle schedule changes
    const handleScheduleChange = () => {
      if (scheduleId) {
        console.log("Invalidating scheduleHistory cache for:", scheduleId);
        queryClient.invalidateQueries({ queryKey: ['scheduleHistory', scheduleId] });
      }
    };

    // Invalidate cache when the scheduleId changes
    handleScheduleChange();

    // Return cleanup function
    return () => {
      // Nothing to clean up
    };
  }, [scheduleId, queryClient]);

  return useQuery({
    queryKey: ['scheduleHistory', scheduleId],
    queryFn: async (): Promise<HistoryEntry[]> => {
      // Only proceed if we have a valid scheduleId
      if (!scheduleId) return [];
      
      try {
        console.log("Fetching history data for schedule:", scheduleId);
        
        // Fetch the history entries with proper ordering (newest first)
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
        
        console.log("Raw history entries:", historyEntries);
        
        // Once we have the history entries, fetch the user profiles in a separate query
        // Create a list of unique user IDs
        const userIds = Array.from(new Set(historyEntries
          .filter(entry => entry.changed_by)
          .map(entry => entry.changed_by)));
        
        let userProfiles: Record<string, { full_name?: string; email?: string }> = {};
        
        // Only fetch user profiles if we have user IDs
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name, email')
            .in('id', userIds as string[]);

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
        const transformedEntries = historyEntries.map(entry => {
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
        
        console.log("Transformed history entries:", transformedEntries);
        return transformedEntries;
        
      } catch (error) {
        console.error("Error in useScheduleHistory:", error);
        throw error;
      }
    },
    enabled: !!scheduleId, // Only run the query if scheduleId is provided
    refetchOnWindowFocus: false, // We don't want to refetch when window focus changes
    refetchOnMount: true, // Refetch when component mounts
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache the results
  });
}
