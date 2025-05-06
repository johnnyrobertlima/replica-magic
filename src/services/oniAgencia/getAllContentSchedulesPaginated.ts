
import { CalendarEvent } from "@/types/oni-agencia";
import { getBaseQuery } from "./baseQuery";

/**
 * Versão otimizada da função getAllContentSchedules com suporte a paginação
 * para melhorar a performance e reduzir a carga no banco de dados
 */
export async function getAllContentSchedulesPaginated(
  year: number | null, 
  month: number | null, 
  page: number = 1,
  pageSize: number = 50,
  selectedCollaborator: string | null = null,
  serviceIds: string[] = []
): Promise<CalendarEvent[]> {
  try {
    let query = getBaseQuery();
    
    // Apply date filters only if year and month are provided
    if (year !== null && month !== null) {
      // Calculate the start and end dates for the given month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      
      query = query
        .gte('scheduled_date', startDate.toISOString().split('T')[0])
        .lte('scheduled_date', endDate.toISOString().split('T')[0]);
      
      console.log(`Fetching paginated events for all clients in date range:`, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        page,
        pageSize,
        selectedCollaborator,
        serviceIds
      });
    } else {
      console.log(`Fetching all paginated events for all clients`, {
        page,
        pageSize,
        selectedCollaborator,
        serviceIds
      });
    }

    const offset = (page - 1) * pageSize;

    // Order by scheduled_date
    query = query.order('scheduled_date', { ascending: true });
      
    // Adicionar filtro de colaborador se especificado
    if (selectedCollaborator) {
      query = query.or(`collaborator_id.eq.${selectedCollaborator},creators.cs.{${selectedCollaborator}}`);
    }
    
    // Adicionar filtro de serviços se especificado
    if (serviceIds && serviceIds.length > 0) {
      query = query.in('service_id', serviceIds);
    }
    
    // Finalizar a consulta com paginação
    const { data, error } = await query.range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Error fetching all content schedules paginated:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`No content schedules found for the specified filters (page ${page})`);
      return [];
    }
    
    console.log(`Fetched ${data.length} content schedules from page ${page}`);
    
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
    console.error('Error in getAllContentSchedulesPaginated:', error);
    throw error;
  }
}
