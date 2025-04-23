
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

    // Verificar se o clientId é válido
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
    
    // Garantir que os dados estejam em um formato seguro
    const safeData = data.map(item => {
      return {
        ...item,
        creators: Array.isArray(item.creators) ? item.creators : 
                 (item.creators ? [String(item.creators)] : [])
      };
    });

    return safeData as unknown as CalendarEvent[];
  } catch (error) {
    console.error('Error in getContentSchedules:', error);
    throw error;
  }
}

export async function getAllContentSchedules(clientId: string): Promise<CalendarEvent[]> {
  try {
    // Verificar se o clientId é válido
    if (!clientId) {
      console.error('Error in getAllContentSchedules: Invalid clientId');
      return [];
    }

    console.log(`Fetching all events for client: ${clientId}`);

    // Optimize query by limiting to just a smaller period around current date
    // This significantly improves performance by fetching less data
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);  // 1 month before
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 0);    // 2 months ahead

    // Podemos limitar as colunas retornadas na consulta principal para otimizar
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
    
    // Garantir que os dados estejam em um formato seguro
    const safeData = data.map(item => {
      return {
        ...item,
        creators: Array.isArray(item.creators) ? item.creators : 
                 (item.creators ? [String(item.creators)] : [])
      };
    });

    return safeData as unknown as CalendarEvent[];
  } catch (error) {
    console.error('Error in getAllContentSchedules:', error);
    throw error;
  }
}

// Helper function to sanitize data before sending to the API
const sanitizeScheduleData = (schedule: ContentScheduleFormData | Partial<ContentScheduleFormData>) => {
  const processedSchedule = { ...schedule };
  
  // Ensure title is never null or empty before submitting to the database
  if ('title' in processedSchedule && (!processedSchedule.title || processedSchedule.title === "")) {
    processedSchedule.title = " "; // Use a space character to satisfy NOT NULL constraint
  }
  
  // CRITICAL: Ensure service_id is never null as it's a required field in the database
  if ('service_id' in processedSchedule) {
    if (processedSchedule.service_id === "" || processedSchedule.service_id === null) {
      delete processedSchedule.service_id;
    }
  }
  
  // Ensure creators is always stored as an array, not null or undefined
  if ('creators' in processedSchedule) {
    if (!Array.isArray(processedSchedule.creators)) {
      processedSchedule.creators = processedSchedule.creators ? [processedSchedule.creators] : [];
    }
  }
  
  // Ensure UUID fields are null, not empty strings
  if ('status_id' in processedSchedule && processedSchedule.status_id === "") {
    processedSchedule.status_id = null;
  }
  
  if ('editorial_line_id' in processedSchedule && processedSchedule.editorial_line_id === "") {
    processedSchedule.editorial_line_id = null;
  }
  
  if ('product_id' in processedSchedule && processedSchedule.product_id === "") {
    processedSchedule.product_id = null;
  }
  
  if ('collaborator_id' in processedSchedule && processedSchedule.collaborator_id === "") {
    processedSchedule.collaborator_id = null;
  }
  
  return processedSchedule;
};

export async function createContentSchedule(schedule: ContentScheduleFormData): Promise<OniAgenciaContentSchedule> {
  try {
    // Sanitize the data before submitting
    const processedSchedule = sanitizeScheduleData(schedule);
    
    // Make sure required fields are present and not undefined/null for create operation
    if (!processedSchedule.client_id || !processedSchedule.scheduled_date || processedSchedule.title === undefined) {
      throw new Error('Missing required fields for content schedule creation');
    }
    
    // CRITICAL: Ensure service_id is NEVER null as it's a required field
    if (!processedSchedule.service_id) {
      throw new Error('service_id is required for content schedule creation');
    }
    
    // For creation, we need to ensure all required fields are set
    const createData = {
      client_id: processedSchedule.client_id,
      service_id: processedSchedule.service_id, // Must be non-null
      title: processedSchedule.title || " ", // Ensure it's never null or empty
      scheduled_date: processedSchedule.scheduled_date,
      // Optional fields
      collaborator_id: processedSchedule.collaborator_id,
      description: processedSchedule.description,
      execution_phase: processedSchedule.execution_phase,
      editorial_line_id: processedSchedule.editorial_line_id,
      product_id: processedSchedule.product_id,
      status_id: processedSchedule.status_id
    };
    
    console.log('Creating content schedule:', createData);
    
    const { data, error } = await supabase
      .from(ONI_AGENCIA_CONTENT_SCHEDULES_TABLE)
      .insert(createData)
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
    // Sanitize the data before submitting
    const processedSchedule = sanitizeScheduleData(schedule);
    
    console.log('Updating content schedule:', id, processedSchedule);
    
    // CRITICAL FIX: If service_id is being set to null, we need to handle it specially
    if ('service_id' in schedule && (schedule.service_id === null || schedule.service_id === "")) {
      // First, fetch the current record to get the existing service_id
      const { data: existingRecord, error: fetchError } = await supabase
        .from(ONI_AGENCIA_CONTENT_SCHEDULES_TABLE)
        .select('service_id')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        console.error('Error fetching existing content schedule:', fetchError);
        throw fetchError;
      }
      
      // If we found an existing record, use its service_id value
      if (existingRecord && existingRecord.service_id) {
        processedSchedule.service_id = existingRecord.service_id;
        console.log('Using existing service_id value for update:', existingRecord.service_id);
      } else {
        // This shouldn't happen, but if it does, we'll reject the update
        console.error('Cannot update schedule: no existing service_id found and null value not allowed');
        throw new Error('service_id cannot be null');
      }
    }
    
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
