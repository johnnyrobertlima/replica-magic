
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HistoryEntry {
  id: string;
  schedule_id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  created_at: string;
}

export function useHistoryTab(scheduleId: string | undefined, enabled: boolean) {
  const {
    data: historyData = [],
    isLoading: isLoadingHistory,
    isError: isHistoryError,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["scheduleHistory", scheduleId],
    queryFn: async () => {
      if (!scheduleId) return [];
      
      console.log("Fetching history data for schedule:", scheduleId);
      
      const { data, error } = await supabase
        .from("oni_agencia_schedule_history")
        .select("*")
        .eq("schedule_id", scheduleId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching schedule history:", error);
        throw error;
      }
      
      return data as HistoryEntry[];
    },
    enabled: !!scheduleId && enabled,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    historyData,
    isLoadingHistory,
    isHistoryError,
    refetchHistory
  };
}
