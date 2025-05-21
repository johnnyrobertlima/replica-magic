
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
        
        console.log(`useEventsByDate fetched ${result.length} events for ${clientId} in ${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}`);
        console.log(`useCaptureDate flag: ${useCaptureDate}`);
        
        if (useCaptureDate) {
          // Filter by capture_date
          const filteredEvents = result.filter((event: CalendarEvent) => {
            // Se não tiver data de captura, não devemos considerar
            if (!event.capture_date) return false;
            
            // Verificar se o status é "Liberado para Captura" - obrigatório para capturas
            const isLiberadoParaCaptura = event?.status?.name === "Liberado para Captura";
            if (!isLiberadoParaCaptura) return false;
            
            // Se estamos apenas verificando os eventos do mês para a tela de capturas,
            // retornar todos que têm data de captura nesse mês
            const captureDate = event.capture_date.split('T')[0]; // Extrair apenas a parte da data
            const captureDateMonth = new Date(captureDate).getMonth() + 1;
            const captureDateYear = new Date(captureDate).getFullYear();
            
            // Se a data do calendário for específica (p. ex. clicar num dia),
            // filtrar por essa data especificamente
            if (formattedDate) {
              return captureDate === formattedDate && isLiberadoParaCaptura;
            }
            
            // Caso contrário, retornar eventos no mesmo mês e ano
            return (
              captureDateMonth === selectedDate.getMonth() + 1 &&
              captureDateYear === selectedDate.getFullYear() &&
              isLiberadoParaCaptura
            );
          });
          
          console.log(`useEventsByDate filtered ${filteredEvents.length} events with capture_date and status "Liberado para Captura"`);
          return filteredEvents;
        } else {
          // Filter by scheduled_date (original behavior)
          const filteredEvents = result.filter((event: CalendarEvent) => {
            // Ensure we're comparing just the date part (YYYY-MM-DD)
            return event.scheduled_date === formattedDate;
          });
          
          console.log(`useEventsByDate filtered ${filteredEvents.length} events with scheduled_date ${formattedDate}`);
          return filteredEvents;
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
