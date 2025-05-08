
import { useQuery } from "@tanstack/react-query";
import { getContentSchedules } from "@/services/oniAgenciaContentScheduleServices";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";

export function useEventsByDate(clientId: string, selectedDate: Date, enabled: boolean = true) {
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', clientId, formattedDate],
    queryFn: async () => {
      if (!clientId) return [];
      const result = await getContentSchedules(clientId, selectedDate.getFullYear(), selectedDate.getMonth() + 1);
      return result.filter((event: CalendarEvent) => event.scheduled_date === formattedDate);
    },
    enabled: !!clientId && enabled
  });

  return { events, isLoading };
}
