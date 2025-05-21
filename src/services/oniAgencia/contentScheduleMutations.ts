
import { supabase } from "@/integrations/supabase/client";
import { ContentScheduleFormData } from "@/types/oni-agencia";

// Create a new content schedule with optional capture data
export async function createContentSchedule(data: ContentScheduleFormData) {
  try {
    // First create the content schedule
    const { data: scheduleData, error: scheduleError } = await supabase
      .from("oni_agencia_content_schedules")
      .insert({
        client_id: data.client_id,
        service_id: data.service_id,
        collaborator_id: data.collaborator_id || null,
        title: data.title || null,
        description: data.description || null,
        scheduled_date: data.scheduled_date,
        execution_phase: data.execution_phase || null,
        editorial_line_id: data.editorial_line_id || null,
        product_id: data.product_id || null,
        status_id: data.status_id || null,
        creators: data.creators || null,
      })
      .select()
      .single();

    if (scheduleError) {
      throw new Error(`Error creating content schedule: ${scheduleError.message}`);
    }
    
    // If we have capture data, insert it into the capture table
    if (data.capture_date) {
      const { error: captureError } = await supabase
        .from("oniagencia_capturas")
        .insert({
          content_schedule_id: scheduleData.id,
          capture_date: data.capture_date,
          capture_end_date: data.capture_end_date || null,
          is_all_day: data.is_all_day || true,
          location: data.location || null,
        });

      if (captureError) {
        throw new Error(`Error creating capture data: ${captureError.message}`);
      }
    }

    return scheduleData;
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
    // First update the content schedule
    const scheduleUpdateData: any = {};
    
    // Only add fields that are part of the content schedule table
    if (data.client_id !== undefined) scheduleUpdateData.client_id = data.client_id;
    if (data.service_id !== undefined) scheduleUpdateData.service_id = data.service_id;
    if (data.collaborator_id !== undefined) scheduleUpdateData.collaborator_id = data.collaborator_id;
    if (data.title !== undefined) scheduleUpdateData.title = data.title;
    if (data.description !== undefined) scheduleUpdateData.description = data.description;
    if (data.scheduled_date !== undefined) scheduleUpdateData.scheduled_date = data.scheduled_date;
    if (data.execution_phase !== undefined) scheduleUpdateData.execution_phase = data.execution_phase;
    if (data.editorial_line_id !== undefined) scheduleUpdateData.editorial_line_id = data.editorial_line_id;
    if (data.product_id !== undefined) scheduleUpdateData.product_id = data.product_id;
    if (data.status_id !== undefined) scheduleUpdateData.status_id = data.status_id;
    if (data.creators !== undefined) scheduleUpdateData.creators = data.creators;

    // Only proceed with schedule update if we have data to update
    if (Object.keys(scheduleUpdateData).length > 0) {
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
      if (data.capture_date !== undefined) captureData.capture_date = data.capture_date;
      if (data.capture_end_date !== undefined) captureData.capture_end_date = data.capture_end_date;
      if (data.is_all_day !== undefined) captureData.is_all_day = data.is_all_day;
      if (data.location !== undefined) captureData.location = data.location;

      if (Object.keys(captureData).length > 0) {
        if (existingCapture) {
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
          const { error: insertCaptureError } = await supabase
            .from("oniagencia_capturas")
            .insert({
              content_schedule_id: id,
              ...captureData
            });

          if (insertCaptureError) {
            throw new Error(`Error creating capture data: ${insertCaptureError.message}`);
          }
        }
      }
    }

    return { id };
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
