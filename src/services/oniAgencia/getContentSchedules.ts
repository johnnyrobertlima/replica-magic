
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";

// Get content schedules for a specific client, year and month
export async function getContentSchedules(
  clientId: string,
  year: number,
  month: number
): Promise<CalendarEvent[]> {
  try {
    // Calculate start and end date for the requested month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    // Format dates as YYYY-MM-DD for Postgres
    const startDateString = startDate.toISOString().split("T")[0];
    const endDateString = endDate.toISOString().split("T")[0];

    // Use the view that joins content schedules with captures
    const { data, error } = await supabase
      .from("oni_agencia_schedules_with_captures")
      .select(`
        *,
        service:service_id(id, name, category, color),
        collaborator:collaborator_id(id, name, email, photo_url),
        editorial_line:editorial_line_id(id, name, symbol, color),
        product:product_id(id, name, symbol, color),
        status:status_id(id, name, color),
        client:client_id(id, name)
      `)
      .eq("client_id", clientId)
      .gte("scheduled_date", startDateString)
      .lte("scheduled_date", endDateString)
      .order("scheduled_date", { ascending: true });

    if (error) {
      throw new Error(`Error fetching content schedules: ${error.message}`);
    }

    // Após buscar os agendamentos, vamos buscar também as capturas do mês
    const { data: captures, error: capturesError } = await supabase
      .from("oni_agencia_schedules_with_captures")
      .select(`
        *,
        service:service_id(id, name, category, color),
        collaborator:collaborator_id(id, name, email, photo_url),
        editorial_line:editorial_line_id(id, name, symbol, color),
        product:product_id(id, name, symbol, color),
        status:status_id(id, name, color),
        client:client_id(id, name)
      `)
      .eq("client_id", clientId)
      .not("capture_date", "is", null)
      .order("capture_date", { ascending: true });

    if (capturesError) {
      console.error("Error fetching captures:", capturesError);
      // Continue com os agendamentos normais se houver erro na busca de capturas
      return data as CalendarEvent[];
    }

    console.log(`getContentSchedules: Found ${data?.length || 0} regular schedules`);
    console.log(`getContentSchedules: Found ${captures?.length || 0} captures`);

    // Combine os resultados, evitando duplicatas (mantendo o mesmo evento se ele tiver tanto scheduled_date quanto capture_date)
    const allEvents = [...(data || [])];
    
    // Adiciona capturas que não estão presentes nos agendamentos regulares
    captures?.forEach(capture => {
      // Verifica se já existe um evento com o mesmo ID
      const existingIndex = allEvents.findIndex(e => e.id === capture.id);
      if (existingIndex >= 0) {
        // Atualiza o evento existente com os dados da captura
        allEvents[existingIndex] = {
          ...allEvents[existingIndex],
          capture_date: capture.capture_date,
          capture_end_date: capture.capture_end_date,
          is_all_day: capture.is_all_day,
          location: capture.location
        };
      } else {
        // Adiciona um novo evento
        allEvents.push(capture);
      }
    });

    console.log(`getContentSchedules: Returning ${allEvents.length} total events (including captures)`);
    return allEvents as CalendarEvent[];
  } catch (error) {
    console.error("Error in getContentSchedules:", error);
    throw error;
  }
}
