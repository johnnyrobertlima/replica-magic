
import { CalendarEvent, ContentScheduleFormData } from "@/types/oni-agencia";
import { updateContentSchedule } from "@/services/oniAgenciaContentScheduleServices";
import { parseStringToDate } from "./dateUtils";
import { format } from "date-fns";

/**
 * Prepares event data for an update operation
 */
export const prepareEventUpdateData = (
  originalEvent: CalendarEvent,
  newDate: Date
): { updateData: ContentScheduleFormData; apiData: any } => {
  // Convert scheduled_date to string format for comparison
  const formattedDate = format(newDate, "yyyy-MM-dd");
  
  // Create a proper ContentScheduleFormData object with all required fields
  const updateData: ContentScheduleFormData = {
    client_id: originalEvent.client_id,
    service_id: originalEvent.service_id,
    collaborator_id: originalEvent.collaborator_id,
    title: originalEvent.title,
    description: originalEvent.description,
    scheduled_date: newDate, // Use Date object directly
    execution_phase: originalEvent.execution_phase,
    editorial_line_id: originalEvent.editorial_line_id,
    product_id: originalEvent.product_id,
    status_id: originalEvent.status_id,
    creators: originalEvent.creators,
    // Convert string dates to Date objects if present
    capture_date: originalEvent.capture_date ? parseStringToDate(originalEvent.capture_date) : null,
    capture_end_date: originalEvent.capture_end_date ? parseStringToDate(originalEvent.capture_end_date) : null,
    is_all_day: originalEvent.is_all_day,
    location: originalEvent.location
  };
  
  // Remove unnecessary fields for API call
  const { 
    id, 
    service, 
    collaborator, 
    editorial_line, 
    product, 
    status, 
    client, 
    created_at, 
    updated_at,
    ...cleanData 
  } = originalEvent as any;
  
  // Convert to API format (strings) for the API call
  const apiData = {
    ...cleanData,
    scheduled_date: formattedDate,
    capture_date: updateData.capture_date instanceof Date ? format(updateData.capture_date, 'yyyy-MM-dd') : cleanData.capture_date,
    capture_end_date: updateData.capture_end_date instanceof Date ? format(updateData.capture_end_date, 'yyyy-MM-dd') : cleanData.capture_end_date
  };
  
  return { updateData, apiData };
};

/**
 * Update an event's scheduled date
 */
export const updateEventScheduledDate = async (
  eventId: string,
  apiData: any
): Promise<void> => {
  if (!eventId) {
    throw new Error("Cannot update event without a valid ID");
  }
  
  console.log(`Making API call to update event with ID: ${eventId}`);
  await updateContentSchedule(eventId, apiData);
};
