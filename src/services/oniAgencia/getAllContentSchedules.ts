
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
    
    // Ensure data is in a safe format with consistent handling of creators field
    const safeData = data.map(item => {
      let creators = [];
      
      // Handle different possible formats of creators field
      if (item.creators) {
        if (Array.isArray(item.creators)) {
          creators = item.creators;
        } else if (typeof item.creators === 'string') {
          try {
            // Try to parse JSON string
            creators = JSON.parse(item.creators);
            // Ensure we have an array after parsing
            if (!Array.isArray(creators)) {
              creators = [creators];
            }
          } catch (e) {
            // If parsing fails, treat as a single string creator
            creators = [item.creators];
          }
        } else {
          // If it's some other type, convert to array with the value
          creators = [item.creators];
        }
      }

      return {
        ...item,
        creators: creators // Always return an array
      };
    });

    return safeData as unknown as CalendarEvent[];
  } catch (error) {
    console.error('Error in getAllContentSchedules:', error);
    throw error;
  }
}
