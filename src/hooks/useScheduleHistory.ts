
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ScheduleHistory {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  changed_by: string | null;
  created_at: string;
}

export function useScheduleHistory(scheduleId: string) {
  return useQuery({
    queryKey: ['scheduleHistory', scheduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('oni_agencia_schedule_history')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ScheduleHistory[];
    },
    enabled: !!scheduleId
  });
}
