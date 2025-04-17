
import { supabase } from "@/integrations/supabase/client";
import { OniAgenciaContentSchedule, ContentScheduleFormData, CalendarEvent } from "@/types/oni-agencia";

const ONI_AGENCIA_CONTENT_SCHEDULES_TABLE = 'oni_agencia_content_schedules';

// Query base com todas as relações necessárias
const getBaseQuery = () => {
  return supabase
    .from(ONI_AGENCIA_CONTENT_SCHEDULES_TABLE)
    .select(`
      *,
      service:service_id(id, name, category, color),
      collaborator:collaborator_id(id, name, email, photo_url),
      editorial_line:editorial_line_id(id, name, symbol, color),
      product:product_id(id, name, symbol, color),
      status:status_id(id, name, color)
    `);
};

export async function getContentSchedules(clientId: string, year: number, month: number): Promise<CalendarEvent[]> {
  try {
    // Calculate the start and end dates for the given month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of the month

    console.log('Fetching events for date range:', {
      clientId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    });

    const { data, error } = await getBaseQuery()
      .eq('client_id', clientId)
      .gte('scheduled_date', startDate.toISOString().split('T')[0])
      .lte('scheduled_date', endDate.toISOString().split('T')[0]);

    if (error) {
      console.error('Error fetching content schedules:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} content schedules for month ${month}/${year}`);
    return data as unknown as CalendarEvent[];
  } catch (error) {
    console.error('Error in getContentSchedules:', error);
    throw error;
  }
}

export async function getAllContentSchedules(clientId: string): Promise<CalendarEvent[]> {
  try {
    console.log('Fetching all events for client:', clientId);

    // Podemos limitar as colunas retornadas na consulta principal para otimizar
    const { data, error } = await getBaseQuery()
      .eq('client_id', clientId);

    if (error) {
      console.error('Error fetching all content schedules:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} content schedules total`);
    return data as unknown as CalendarEvent[];
  } catch (error) {
    console.error('Error in getAllContentSchedules:', error);
    throw error;
  }
}

export async function createContentSchedule(schedule: ContentScheduleFormData): Promise<OniAgenciaContentSchedule> {
  try {
    // Ensure the title is never null before submitting to the database
    const processedSchedule = {
      ...schedule,
      title: schedule.title || " " // Use a space character to satisfy NOT NULL constraint
    };
    
    console.log('Creating content schedule');
    
    const { data, error } = await supabase
      .from(ONI_AGENCIA_CONTENT_SCHEDULES_TABLE)
      .insert(processedSchedule)
      .select()
      .single();

    if (error) {
      console.error('Error creating content schedule:', error);
      throw error;
    }

    console.log('Created content schedule:', data?.id);
    return data as unknown as OniAgenciaContentSchedule;
  } catch (error) {
    console.error('Error creating content schedule:', error);
    throw error;
  }
}

export async function updateContentSchedule(id: string, schedule: Partial<ContentScheduleFormData>): Promise<OniAgenciaContentSchedule> {
  try {
    // Process the schedule data to handle title
    const processedSchedule = { ...schedule };
    
    // If title is included in the update, ensure it's not null
    if ('title' in processedSchedule && (processedSchedule.title === null || processedSchedule.title === "")) {
      processedSchedule.title = " "; // Use a space character to satisfy NOT NULL constraint
    }
    
    console.log('Updating content schedule:', id);
    
    // Only update the fields that are actually provided
    const { data, error } = await supabase
      .from(ONI_AGENCIA_CONTENT_SCHEDULES_TABLE)
      .update(processedSchedule)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content schedule:', error);
      throw error;
    }

    console.log('Updated content schedule:', id);
    return data as unknown as OniAgenciaContentSchedule;
  } catch (error) {
    console.error('Error updating content schedule:', error);
    throw error;
  }
}

export async function deleteContentSchedule(id: string): Promise<void> {
  try {
    console.log('Deleting content schedule:', id);
    
    const { error } = await supabase
      .from(ONI_AGENCIA_CONTENT_SCHEDULES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content schedule:', error);
      throw error;
    }
    
    console.log('Deleted content schedule:', id);
  } catch (error) {
    console.error('Error deleting content schedule:', error);
    throw error;
  }
}
