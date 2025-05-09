
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
  // Format date without timezone issues - only if selectedDate is valid
  const formattedDate = selectedDate ? format(new Date(selectedDate), 'yyyy-MM-dd') : '';
  
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', clientId, formattedDate, useCaptureDate],
    queryFn: async () => {
      if (!clientId || !formattedDate) return [];
      
      try {
        // Get schedules for the whole month to avoid timezone issues
        const result = await getContentSchedules(
          clientId, 
          selectedDate.getFullYear(), 
          selectedDate.getMonth() + 1
        );
        
        if (useCaptureDate) {
          // Filter by capture_date
          return result.filter((event: CalendarEvent) => {
            if (!event.capture_date) return false;
            
            // Extract only the date part (without the hour) from capture_date
            const captureDateOnly = event.capture_date.split('T')[0];
            return captureDateOnly === formattedDate;
          });
        } else {
          // Filter by scheduled_date (original behavior)
          return result.filter((event: CalendarEvent) => {
            // Ensure we're comparing just the date part (YYYY-MM-DD)
            return event.scheduled_date === formattedDate;
          });
        }
      } catch (error) {
        console.error("Error fetching events for date:", error);
        return [];
      }
    },
    enabled: !!clientId && !!formattedDate && enabled,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return { events, isLoading };
}
