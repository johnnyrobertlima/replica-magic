
import { ContentScheduleFormData, OniAgenciaContentSchedule } from "@/types/oni-agencia";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeScheduleData } from "./contentScheduleDataProcessor";
import { TABLE_NAME } from "./baseQuery";

export async function createContentSchedule(schedule: ContentScheduleFormData): Promise<OniAgenciaContentSchedule> {
  try {
    const processedSchedule = sanitizeScheduleData(schedule);
    
    if (!processedSchedule.client_id || !processedSchedule.scheduled_date || processedSchedule.title === undefined) {
      throw new Error('Missing required fields for content schedule creation');
    }
    
    if (!processedSchedule.service_id) {
      throw new Error('service_id is required for content schedule creation');
    }
    
    const createData = {
      client_id: processedSchedule.client_id,
      service_id: processedSchedule.service_id,
      title: processedSchedule.title || " ",
      scheduled_date: processedSchedule.scheduled_date,
      collaborator_id: processedSchedule.collaborator_id,
      description: processedSchedule.description,
      execution_phase: processedSchedule.execution_phase,
      editorial_line_id: processedSchedule.editorial_line_id,
      product_id: processedSchedule.product_id,
      status_id: processedSchedule.status_id,
      creators: processedSchedule.creators
    };
    
    console.log('Creating content schedule:', createData);
    
    const { data, error } = await supabase
      .from(TABLE_NAME)
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
    const processedSchedule = sanitizeScheduleData(schedule);
    
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
      { field: 'collaborator_id', name: 'collaborator_id' }
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
