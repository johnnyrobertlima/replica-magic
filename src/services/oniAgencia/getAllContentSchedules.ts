
import { CalendarEvent } from "@/types/oni-agencia";
import { getBaseQuery } from "./baseQuery";

export async function getAllContentSchedules(clientId: string): Promise<CalendarEvent[]> {
  try {
    // Optimize query by limiting to just a smaller period around current date
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);

    console.log(`Fetching events for ${clientId ? `client: ${clientId}` : 'all clients'}`);

    let query = getBaseQuery()
      .gte('scheduled_date', startDate.toISOString().split('T')[0])
      .lte('scheduled_date', endDate.toISOString().split('T')[0]);
    
    // Only filter by client_id if a specific client is selected
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching all content schedules:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`No content schedules found ${clientId ? `for client ${clientId}` : 'for any client'}`);
      return [];
    }
    
    console.log(`Fetched ${data.length} content schedules total`);
    
    // Process data to ensure consistent handling of creators field
    const safeData = data.map(item => {
      // Create a normalized version of creators that's always an array of strings
      let creatorsArray: string[] = [];
      
      if (item.creators !== null && item.creators !== undefined) {
        if (Array.isArray(item.creators)) {
          // If it's already an array, use it directly
          creatorsArray = item.creators;
        } else if (typeof item.creators === 'string') {
          try {
            // Try to parse JSON string
            const parsed = JSON.parse(item.creators);
            // Handle both array and single string cases
            creatorsArray = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            // If parsing fails, treat as a single string creator
            creatorsArray = [item.creators];
          }
        } else {
          // Handle any other possible type
          creatorsArray = [String(item.creators)];
        }
      }

      return {
        ...item,
        creators: creatorsArray // Always return a proper array
      };
    });

    return safeData as unknown as CalendarEvent[];
  } catch (error) {
    console.error('Error in getAllContentSchedules:', error);
    throw error;
  }
}
