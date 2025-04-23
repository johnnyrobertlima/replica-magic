
import { CalendarEvent } from "@/types/oni-agencia";
import { getBaseQuery } from "./baseQuery";

export async function getAllContentSchedules(clientId: string): Promise<CalendarEvent[]> {
  try {
    if (!clientId) {
      console.error('Error in getAllContentSchedules: Invalid clientId');
      return [];
    }

    console.log(`Fetching all events for client: ${clientId}`);

    // Optimize query by limiting to just a smaller period around current date
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

    const { data, error } = await getBaseQuery()
      .eq('client_id', clientId)
      .gte('scheduled_date', startDate.toISOString().split('T')[0])
      .lte('scheduled_date', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching all content schedules:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`No content schedules found for client ${clientId}`);
      return [];
    }
    
    console.log(`Fetched ${data.length} content schedules total`);
    
    // Ensure data is in a safe format
    const safeData = data.map(item => ({
      ...item,
      creators: Array.isArray(item.creators) ? item.creators : 
               (item.creators ? [String(item.creators)] : [])
    }));

    return safeData as unknown as CalendarEvent[];
  } catch (error) {
    console.error('Error in getAllContentSchedules:', error);
    throw error;
  }
}
