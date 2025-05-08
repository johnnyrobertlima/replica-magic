
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";

// Get calendar events for a specific client and month
export const getCalendarEvents = async (
  clientId: string,
  month: number,
  year: number
): Promise<CalendarEvent[]> => {
  try {
    // Format month for date filtering
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;

    const { data, error } = await supabase
      .from("oni_agencia_content_schedules")
      .select(`
        *,
        service:service_id(*),
        collaborator:collaborator_id(*),
        editorial_line:editorial_line_id(*),
        product:product_id(*),
        status:status_id(*),
        client:client_id(id, name)
      `)
      .eq("client_id", clientId)
      .gte("scheduled_date", startDate)
      .lt("scheduled_date", endDate);

    if (error) {
      console.error("Error fetching calendar events:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getCalendarEvents:", error);
    return [];
  }
};

// Update event date
export const updateEventDate = async (
  eventId: string,
  newDate: Date
): Promise<void> => {
  try {
    const formattedDate = newDate.toISOString().split('T')[0];
    
    const { error } = await supabase
      .from("oni_agencia_content_schedules")
      .update({ scheduled_date: formattedDate })
      .eq("id", eventId);

    if (error) {
      console.error("Error updating event date:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in updateEventDate:", error);
    throw error;
  }
};
