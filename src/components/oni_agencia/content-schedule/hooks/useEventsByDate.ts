
import { useQuery } from "@tanstack/react-query";
import { getContentSchedules } from "@/services/oniAgenciaContentScheduleServices";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/oni-agencia";

export function useEventsByDate(
  clientId: string, 
  selectedDate: Date, 
  enabled: boolean = true,
  useCaptureDate: boolean = false
) {
  const formattedDate = format(selectedDate, 'yyyy-MM-dd');
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', clientId, formattedDate, useCaptureDate],
    queryFn: async () => {
      if (!clientId) return [];
      const result = await getContentSchedules(clientId, selectedDate.getFullYear(), selectedDate.getMonth() + 1);
      
      if (useCaptureDate) {
        // Filter by capture_date
        return result.filter((event: CalendarEvent) => {
          if (!event.capture_date) return false;
          const captureDateOnly = event.capture_date.split('T')[0];
          return captureDateOnly === formattedDate;
        });
      } else {
        // Filter by scheduled_date (original behavior)
        return result.filter((event: CalendarEvent) => event.scheduled_date === formattedDate);
      }
    },
    enabled: !!clientId && enabled
  });

  return { events, isLoading };
}
