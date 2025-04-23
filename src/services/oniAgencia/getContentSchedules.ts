
import { CalendarEvent } from "@/types/oni-agencia";
import { getBaseQuery } from "./baseQuery";

export async function getContentSchedules(clientId: string, year: number, month: number): Promise<CalendarEvent[]> {
  try {
    // Calculate the start and end dates for the given month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    if (!clientId) {
      console.error('Error in getContentSchedules: Invalid clientId');
      return [];
    }

    console.log(`Fetching events for date range:`, {
      clientId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    const { data, error } = await getBaseQuery()
      .eq('client_id', clientId)
      .gte('scheduled_date', startDate.toISOString().split('T')[0])
      .lte('scheduled_date', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching content schedules:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`No content schedules found for month ${month}/${year}`);
      return [];
    }
    
    console.log(`Fetched ${data.length} content schedules for month ${month}/${year}`);
    
    // Ensure data is in a safe format
    const safeData = data.map(item => {
      let creators = item.creators;
      
      if (typeof item.creators === 'string') {
        try {
          creators = JSON.parse(item.creators);
        } catch (e) {
          creators = [item.creators];
        }
      } else if (!Array.isArray(item.creators) && item.creators !== null) {
        creators = [item.creators];
      } else if (item.creators === null) {
        creators = [];
      }

      return {
        ...item,
        creators: creators || []
      };
    });

    return safeData as unknown as CalendarEvent[];
  } catch (error) {
    console.error('Error in getContentSchedules:', error);
    throw error;
  }
}
