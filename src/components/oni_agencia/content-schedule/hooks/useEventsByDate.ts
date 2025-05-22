
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
        
        console.log(`useEventsByDate fetched ${result.length} events, useCaptureDate=${useCaptureDate}`);
        
        // Adicionar log para verificar quantos eventos têm capture_date
        const eventsWithCapture = result.filter(event => event.capture_date != null);
        console.log(`useEventsByDate found ${eventsWithCapture.length} events with capture_date`);
        
        // Para cada evento com capture_date, exibir o ID e a data de captura
        eventsWithCapture.forEach(event => {
          console.log(`Event ${event.id} has capture_date: ${event.capture_date}`);
        });
        
        if (useCaptureDate) {
          // Filter by capture_date - show ALL events with capture dates
          const filteredEvents = result.filter((event: CalendarEvent) => {
            return event.capture_date != null;
          });
          
          console.log(`useEventsByDate returning ${filteredEvents.length} events filtered by capture_date`);
          return filteredEvents;
        } else {
          // Filter by scheduled_date (original behavior)
          const filteredEvents = result.filter((event: CalendarEvent) => {
            // Ensure we're comparing just the date part (YYYY-MM-DD)
            return event.scheduled_date === formattedDate;
          });
          
          console.log(`useEventsByDate returning ${filteredEvents.length} events filtered by scheduled_date`);
          return filteredEvents;
        }
      } catch (error) {
        console.error("Error fetching events for date:", error);
        return [];
      }
    },
    enabled: !!clientId && !!formattedDate && enabled,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });

  return { events, isLoading };
}
