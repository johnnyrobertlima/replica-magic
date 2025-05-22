
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";

// Get content schedules for a specific client, year and month
export async function getContentSchedules(
  clientId: string,
  year: number,
  month: number
): Promise<CalendarEvent[]> {
  try {
    console.log(`Fetching content schedules for client ${clientId}, ${year}-${month}`);
    
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

    // Log the response for debugging
    console.log(`Fetched ${data?.length || 0} schedules for ${year}-${month}`);
    
    return data as CalendarEvent[];
  } catch (error) {
    console.error("Error in getContentSchedules:", error);
    throw error;
  }
}
