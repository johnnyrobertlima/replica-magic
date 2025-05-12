
import { ContentScheduleFormData, OniAgenciaContentSchedule } from "@/types/oni-agencia";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeScheduleData } from "./contentScheduleDataProcessor";
import { TABLE_NAME } from "./baseQuery";
import { format } from "date-fns";

// Helper function to ensure dates are converted to strings
const formatDateForDB = (date: Date | string | null): string | null => {
  if (!date) return null;
  
  if (date instanceof Date) {
    return format(date, "yyyy-MM-dd");
  }
  
  return date;
};

// Helper function to ensure date-times are converted to strings
const formatDateTimeForDB = (date: Date | string | null, isAllDay: boolean | null): string | null => {
  if (!date) return null;
  
  if (date instanceof Date) {
    return isAllDay ? 
      format(date, "yyyy-MM-dd") : 
      format(date, "yyyy-MM-dd'T'HH:mm:ss");
  }
  
  return date;
};

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
    
    // Convert any Date objects to formatted strings for the database
    const createData = {
      client_id: processedSchedule.client_id,
      service_id: processedSchedule.service_id,
      title: processedSchedule.title || " ",
      scheduled_date: formatDateForDB(processedSchedule.scheduled_date),
      capture_date: formatDateTimeForDB(processedSchedule.capture_date, processedSchedule.is_all_day),
      capture_end_date: formatDateTimeForDB(processedSchedule.capture_end_date, processedSchedule.is_all_day),
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
    
    // For status updates, we may only have a subset of fields
    // Make a minimal update data object
    const updateData: Record<string, any> = {};
    
    // Add the fields that are provided
    if (processedSchedule.client_id !== undefined) updateData.client_id = processedSchedule.client_id;
    if (processedSchedule.service_id !== undefined) updateData.service_id = processedSchedule.service_id;
    if (processedSchedule.title !== undefined) updateData.title = processedSchedule.title;
    if (processedSchedule.description !== undefined) updateData.description = processedSchedule.description;
    if (processedSchedule.status_id !== undefined) updateData.status_id = processedSchedule.status_id;
    if (processedSchedule.collaborator_id !== undefined) updateData.collaborator_id = processedSchedule.collaborator_id;
    if (processedSchedule.editorial_line_id !== undefined) updateData.editorial_line_id = processedSchedule.editorial_line_id;
    if (processedSchedule.product_id !== undefined) updateData.product_id = processedSchedule.product_id;
    if (processedSchedule.execution_phase !== undefined) updateData.execution_phase = processedSchedule.execution_phase;
    if (processedSchedule.location !== undefined) updateData.location = processedSchedule.location;
    if (processedSchedule.creators !== undefined) updateData.creators = processedSchedule.creators;
    
    // Only add date fields if they're provided
    if (processedSchedule.scheduled_date !== undefined) {
      updateData.scheduled_date = formatDateForDB(processedSchedule.scheduled_date);
    }
    if (processedSchedule.capture_date !== undefined) {
      updateData.capture_date = formatDateTimeForDB(
        processedSchedule.capture_date, 
        processedSchedule.is_all_day !== undefined ? processedSchedule.is_all_day : null
      );
    }
    if (processedSchedule.capture_end_date !== undefined) {
      updateData.capture_end_date = formatDateTimeForDB(
        processedSchedule.capture_end_date,
        processedSchedule.is_all_day !== undefined ? processedSchedule.is_all_day : null
      );
    }
    if (processedSchedule.is_all_day !== undefined) {
      updateData.is_all_day = processedSchedule.is_all_day;
    }
    
    console.log('Updating content schedule:', id, updateData);
    
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
        updateData.service_id = existingRecord.service_id;
        console.log('Using existing service_id value for update:', existingRecord.service_id);
      } else {
        console.error('Cannot update schedule: no existing service_id found and null value not allowed');
        throw new Error('service_id cannot be null');
      }
    }
    
    // Update the record - use a timeout to avoid potential backend issues
    const updatePromise = new Promise<any>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const { data, error } = await supabase
            .from(TABLE_NAME)
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
            
          if (error) {
            console.error('Error updating content schedule:', error);
            reject(error);
          } else {
            resolve(data);
          }
        } catch (err) {
          reject(err);
        }
      }, 100); // small delay to ensure transactions don't conflict
    });
    
    const data = await updatePromise;
    
    // Record history for important field changes
    const fieldsToTrack = [
      { field: 'status_id', name: 'status_id' },
      { field: 'collaborator_id', name: 'collaborator_id' },
      { field: 'title', name: 'title' },
      { field: 'description', name: 'description' },
      { field: 'scheduled_date', name: 'scheduled_date' },
      { field: 'capture_date', name: 'capture_date' },
      { field: 'capture_end_date', name: 'capture_end_date' },
      { field: 'is_all_day', name: 'is_all_day' },
      { field: 'location', name: 'location' },
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
