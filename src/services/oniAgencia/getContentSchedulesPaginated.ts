
import { CalendarEvent } from "@/types/oni-agencia";
import { getBaseQuery } from "./baseQuery";

/**
 * Versão otimizada da função getContentSchedules com suporte a paginação
 * para melhorar a performance e reduzir a carga no banco de dados
 */
export async function getContentSchedulesPaginated(
  clientId: string, 
  year: number, 
  month: number, 
  page: number = 1,
  pageSize: number = 50
): Promise<CalendarEvent[]> {
  try {
    // Calculate the start and end dates for the given month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month
    const offset = (page - 1) * pageSize;

    if (!clientId) {
      console.error('Error in getContentSchedulesPaginated: Invalid clientId');
      return [];
    }

    console.log(`Fetching paginated events for date range:`, {
      clientId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      page,
      pageSize,
      offset
    });

    // Consulta paginada para reduzir o volume de dados transferidos
    const { data, error } = await getBaseQuery()
      .eq('client_id', clientId)
      .gte('scheduled_date', startDate.toISOString().split('T')[0])
      .lte('scheduled_date', endDate.toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching content schedules paginated:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`No content schedules found for client ${clientId} in month ${month}/${year} (page ${page})`);
      return [];
    }
    
    console.log(`Fetched ${data.length} content schedules from page ${page} for month ${month}/${year}`);
    
    // Normalizar os dados para garantir consistência
    const safeData = data.map(item => {
      // Criar uma versão normalizada de creators que é sempre um array de strings
      let creatorsArray: string[] = [];
      
      if (item.creators !== null && item.creators !== undefined) {
        if (Array.isArray(item.creators)) {
          creatorsArray = item.creators;
        } else if (typeof item.creators === 'string') {
          try {
            const parsed = JSON.parse(item.creators);
            creatorsArray = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            creatorsArray = [item.creators];
          }
        } else {
          creatorsArray = [String(item.creators)];
        }
      }

      return {
        ...item,
        creators: creatorsArray
      };
    });

    return safeData as unknown as CalendarEvent[];
  } catch (error) {
    console.error('Error in getContentSchedulesPaginated:', error);
    throw error;
  }
}
