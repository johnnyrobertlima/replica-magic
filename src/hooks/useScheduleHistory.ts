
import { useQuery } from "@tanstack/react-query";

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
      // Esta seria uma chamada real para a API
      // Por enquanto, simulamos um atraso e retornamos dados mockados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Se não houver ID, retorne um array vazio
      if (!scheduleId) {
        return [];
      }
      
      // Mockando alguns dados de histórico para demonstração
      return [];
    },
    enabled: !!scheduleId,
  });
}
