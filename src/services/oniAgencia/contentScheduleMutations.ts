
import { supabase } from "@/integrations/supabase/client";
import { ContentScheduleFormData } from "@/types/oni-agencia";
import { format } from "date-fns";

// Helper function to convert Date objects to string format for the API
const formatDateForAPI = (date: Date | null): string | null => {
  if (!date) return null;
  return format(date, "yyyy-MM-dd");
};

const formatDateTimeForAPI = (date: Date | null, isAllDay: boolean | null): string | null => {
  if (!date) return null;
  if (isAllDay) {
    return format(date, "yyyy-MM-dd");
  } else {
    return format(date, "yyyy-MM-dd'T'HH:mm:ss");
  }
};

// Create a new content schedule with optional capture data
export async function createContentSchedule(data: ContentScheduleFormData) {
  try {
    // Ensure scheduled_date is set, using capture_date as fallback if needed
    const scheduledDate = data.scheduled_date || data.capture_date;
    
    if (!scheduledDate) {
      throw new Error("Either scheduled_date or capture_date must be provided");
    }
    
    console.log(`Creating content schedule with data:`, data);
    
    // Create a schedule data object without the capture-specific fields
    const scheduleData = {
      client_id: data.client_id,
      service_id: data.service_id,
      collaborator_id: data.collaborator_id || null,
      title: data.title || null,
      description: data.description || null,
      scheduled_date: formatDateForAPI(scheduledDate), // Use the determined date
      execution_phase: data.execution_phase || null,
      editorial_line_id: data.editorial_line_id || null,
      product_id: data.product_id || null,
      status_id: data.status_id || null,
      creators: data.creators || null,
    };

    // First create the content schedule
    const { data: createdSchedule, error: scheduleError } = await supabase
      .from("oni_agencia_content_schedules")
      .insert(scheduleData)
      .select()
      .single();

    if (scheduleError) {
      throw new Error(`Error creating content schedule: ${scheduleError.message}`);
    }
    
    // If we have capture data, insert it into the capture table
    if (data.capture_date) {
      const captureData = {
        content_schedule_id: createdSchedule.id,
        capture_date: formatDateTimeForAPI(data.capture_date, data.is_all_day),
        capture_end_date: formatDateTimeForAPI(data.capture_end_date, data.is_all_day),
        is_all_day: data.is_all_day || false,
        location: data.location || null,
      };

      const { error: captureError } = await supabase
        .from("oniagencia_capturas")
        .insert(captureData);

      if (captureError) {
        throw new Error(`Error creating capture data: ${captureError.message}`);
      }
    }

    return createdSchedule;
  } catch (error: any) {
    console.error("Error in createContentSchedule:", error);
    throw new Error(error.message || "An error occurred while creating the content schedule");
  }
}

// Update an existing content schedule and its capture data
export async function updateContentSchedule(
  id: string,
  data: Partial<ContentScheduleFormData>
) {
  try {
    console.log(`Updating content schedule ${id} with data:`, data);

    // First update the content schedule
    const scheduleUpdateData: any = {};
    
    // Only add fields that are part of the content schedule table
    if (data.client_id !== undefined) scheduleUpdateData.client_id = data.client_id;
    if (data.service_id !== undefined) scheduleUpdateData.service_id = data.service_id;
    
    // Special handling for collaborator_id to handle null values correctly
    if (data.collaborator_id !== undefined) {
      scheduleUpdateData.collaborator_id = data.collaborator_id === "null" ? null : data.collaborator_id;
    }
    
    if (data.title !== undefined) scheduleUpdateData.title = data.title;
    if (data.description !== undefined) scheduleUpdateData.description = data.description;
    
    // For scheduled_date, use capture_date as fallback if needed
    if (data.scheduled_date !== undefined) {
      scheduleUpdateData.scheduled_date = formatDateForAPI(data.scheduled_date);
    } else if (data.capture_date !== undefined && !data.scheduled_date) {
      scheduleUpdateData.scheduled_date = formatDateForAPI(data.capture_date);
    }
    
    if (data.execution_phase !== undefined) scheduleUpdateData.execution_phase = data.execution_phase;
    if (data.editorial_line_id !== undefined) scheduleUpdateData.editorial_line_id = data.editorial_line_id;
    if (data.product_id !== undefined) scheduleUpdateData.product_id = data.product_id;
    if (data.status_id !== undefined) scheduleUpdateData.status_id = data.status_id;
    if (data.creators !== undefined) scheduleUpdateData.creators = data.creators;

    // Only proceed with schedule update if we have data to update
    if (Object.keys(scheduleUpdateData).length > 0) {
      console.log("Sending schedule update with data:", scheduleUpdateData);
      const { error: scheduleError } = await supabase
        .from("oni_agencia_content_schedules")
        .update(scheduleUpdateData)
        .eq("id", id);

      if (scheduleError) {
        throw new Error(`Error updating content schedule: ${scheduleError.message}`);
      }
    }

    // Handle capture data - first check if it exists
    const { data: existingCapture, error: fetchError } = await supabase
      .from("oniagencia_capturas")
      .select()
      .eq("content_schedule_id", id)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Error fetching capture data: ${fetchError.message}`);
    }

    // Prepare capture data if any capture fields are provided
    if (data.capture_date !== undefined || data.capture_end_date !== undefined || 
        data.is_all_day !== undefined || data.location !== undefined) {
      
      const captureData: any = {};
      if (data.capture_date !== undefined) captureData.capture_date = formatDateTimeForAPI(data.capture_date, data.is_all_day);
      if (data.capture_end_date !== undefined) captureData.capture_end_date = formatDateTimeForAPI(data.capture_end_date, data.is_all_day);
      if (data.is_all_day !== undefined) captureData.is_all_day = data.is_all_day;
      if (data.location !== undefined) captureData.location = data.location;

      if (Object.keys(captureData).length > 0) {
        if (existingCapture) {
          console.log("Updating existing capture data:", captureData);
          // Update existing capture data
          const { error: updateCaptureError } = await supabase
            .from("oniagencia_capturas")
            .update(captureData)
            .eq("content_schedule_id", id);

          if (updateCaptureError) {
            throw new Error(`Error updating capture data: ${updateCaptureError.message}`);
          }
        } else {
          // Create new capture data
          captureData.content_schedule_id = id;
          console.log("Creating new capture data:", captureData);
          
          const { error: insertCaptureError } = await supabase
            .from("oniagencia_capturas")
            .insert(captureData);

          if (insertCaptureError) {
            throw new Error(`Error creating capture data: ${insertCaptureError.message}`);
          }
        }
      }
    }

    // Fetch and return the updated record to confirm success
    const { data: updatedSchedule, error: getError } = await supabase
      .from("oni_agencia_content_schedules")
      .select()
      .eq("id", id)
      .single();
    
    if (getError) {
      console.warn("Could not fetch updated schedule:", getError);
      // Don't throw here, just return success with ID
      return { id, success: true };
    }
    
    return updatedSchedule;
  } catch (error: any) {
    console.error("Error in updateContentSchedule:", error);
    throw new Error(error.message || "An error occurred while updating the content schedule");
  }
}

// Delete a content schedule (capture data will be deleted via CASCADE)
export async function deleteContentSchedule(id: string) {
  try {
    const { error } = await supabase
      .from("oni_agencia_content_schedules")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Error deleting content schedule: ${error.message}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteContentSchedule:", error);
    throw new Error(error.message || "An error occurred while deleting the content schedule");
  }
}
