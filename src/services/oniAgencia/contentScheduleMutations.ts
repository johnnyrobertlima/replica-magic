
import { ContentScheduleFormData, OniAgenciaContentSchedule } from "@/types/oni-agencia";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeScheduleData } from "./contentScheduleDataProcessor";
import { TABLE_NAME } from "./baseQuery";

export async function createContentSchedule(schedule: ContentScheduleFormData): Promise<OniAgenciaContentSchedule> {
  try {
    const processedSchedule = sanitizeScheduleData(schedule);
    
    if (!processedSchedule.client_id || processedSchedule.title === undefined) {
      throw new Error('Missing required fields for content schedule creation');
    }
    
    // Verifica se pelo menos scheduled_date OU capture_date está presente
    if (!processedSchedule.scheduled_date && !processedSchedule.capture_date) {
      throw new Error('Either scheduled_date or capture_date is required for content schedule creation');
    }
    
    if (!processedSchedule.service_id) {
      throw new Error('service_id is required for content schedule creation');
    }
    
    const createData = {
      client_id: processedSchedule.client_id,
      service_id: processedSchedule.service_id,
      title: processedSchedule.title || " ",
      scheduled_date: processedSchedule.scheduled_date || null, // Permitimos que seja nulo se capture_date estiver presente
      capture_date: processedSchedule.capture_date || null,
      capture_end_date: processedSchedule.capture_end_date || null,
      is_all_day: processedSchedule.is_all_day !== null ? processedSchedule.is_all_day : true,
      location: processedSchedule.location || null,
      collaborator_id: processedSchedule.collaborator_id,
      description: processedSchedule.description,
      execution_phase: processedSchedule.execution_phase,
      editorial_line_id: processedSchedule.editorial_line_id,
      product_id: processedSchedule.product_id,
      status_id: processedSchedule.status_id,
      creators: processedSchedule.creators
    };
    
    console.log('Creating content schedule:', createData);
    
    // First create the schedule
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert(createData)
      .select()
      .single();

    if (error) {
      console.error('Error creating content schedule:', error);
      throw error;
    }

    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Record creation in history
    if (data && data.id) {
      // Add a creation entry to history
      const historyEntry = {
        schedule_id: data.id,
        field_name: 'creation',
        old_value: null,
        new_value: 'created',
        changed_by: userId
      };
      
      const { error: historyError } = await supabase
        .from('oni_agencia_schedule_history')
        .insert(historyEntry);
        
      if (historyError) {
        console.error('Error recording creation history:', historyError);
        // Don't throw, just log the error
      }
      
      // Also record initial status and collaborator if provided
      if (processedSchedule.status_id) {
        const statusHistoryEntry = {
          schedule_id: data.id,
          field_name: 'status_id',
          old_value: null,
          new_value: processedSchedule.status_id,
          changed_by: userId
        };
        
        await supabase
          .from('oni_agencia_schedule_history')
          .insert(statusHistoryEntry);
      }
      
      if (processedSchedule.collaborator_id) {
        const collaboratorHistoryEntry = {
          schedule_id: data.id,
          field_name: 'collaborator_id',
          old_value: null,
          new_value: processedSchedule.collaborator_id,
          changed_by: userId
        };
        
        await supabase
          .from('oni_agencia_schedule_history')
          .insert(collaboratorHistoryEntry);
      }
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
    // We need to be careful about nested objects that come from the view
    // Remove any properties that aren't direct columns in the table
    const { 
      client, 
      service, 
      collaborator, 
      editorial_line, 
      product, 
      status, 
      ...cleanedSchedule 
    } = schedule as any;
    
    // Now process the cleaned schedule data
    const processedSchedule = sanitizeScheduleData(cleanedSchedule);
    
    console.log('Updating content schedule:', id, processedSchedule);
    
    // Fetch the existing record to compare changes
    const { data: existingRecord, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) {
      console.error('Error fetching existing content schedule:', fetchError);
      throw fetchError;
    }
    
    // Handle service_id specially to prevent nulling
    if ('service_id' in schedule && (schedule.service_id === null || schedule.service_id === "")) {
      if (existingRecord && existingRecord.service_id) {
        processedSchedule.service_id = existingRecord.service_id;
        console.log('Using existing service_id value for update:', existingRecord.service_id);
      } else {
        console.error('Cannot update schedule: no existing service_id found and null value not allowed');
        throw new Error('service_id cannot be null');
      }
    }
    
    // Update the record
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(processedSchedule)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content schedule:', error);
      throw error;
    }
    
    // Record history for important field changes
    const fieldsToTrack = [
      { field: 'status_id', name: 'status_id' },
      { field: 'collaborator_id', name: 'collaborator_id' },
      { field: 'title', name: 'title' },
      { field: 'description', name: 'description' },
      { field: 'scheduled_date', name: 'scheduled_date' },
      { field: 'editorial_line_id', name: 'editorial_line_id' },
      { field: 'product_id', name: 'product_id' }
    ];
    
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    
    // Process history recording for tracked fields
    for (const fieldConfig of fieldsToTrack) {
      const { field, name } = fieldConfig;
      
      if (schedule[field] !== undefined && existingRecord[field] !== schedule[field]) {
        console.log(`Recording history for ${name} change:`, {
          old: existingRecord[field],
          new: schedule[field]
        });
        
        // Record in history table
        const historyEntry = {
          schedule_id: id,
          field_name: name,
          old_value: existingRecord[field],
          new_value: schedule[field],
          changed_by: userId
        };
        
        const { error: historyError } = await supabase
          .from('oni_agencia_schedule_history')
          .insert(historyEntry);
          
        if (historyError) {
          console.error('Error recording history:', historyError);
          // Don't throw here, just log - we don't want to fail the update if history recording fails
        }
      }
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
      .from(TABLE_NAME)
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
