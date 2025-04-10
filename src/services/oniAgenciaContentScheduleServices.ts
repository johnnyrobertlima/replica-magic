
import { supabase } from "@/integrations/supabase/client";
import { OniAgenciaContentSchedule, ContentScheduleFormData, CalendarEvent } from "@/types/oni-agencia";

const ONI_AGENCIA_CONTENT_SCHEDULES_TABLE = 'oni_agencia_content_schedules';

export async function getContentSchedules(clientId: string, year: number, month: number): Promise<CalendarEvent[]> {
  // Calculate the start and end dates for the given month
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  const { data, error } = await supabase
    .from(ONI_AGENCIA_CONTENT_SCHEDULES_TABLE)
    .select(`
      *,
      service:service_id(id, name, category, color),
      collaborator:collaborator_id(id, name, email, photo_url)
    `)
    .eq('client_id', clientId)
    .gte('scheduled_date', startDate.toISOString().split('T')[0])
    .lte('scheduled_date', endDate.toISOString().split('T')[0]);

  if (error) {
    console.error('Error fetching content schedules:', error);
    throw error;
  }

  return data || [];
}

export async function createContentSchedule(schedule: ContentScheduleFormData): Promise<OniAgenciaContentSchedule> {
  try {
    const { data, error } = await supabase
      .from(ONI_AGENCIA_CONTENT_SCHEDULES_TABLE)
      .insert(schedule)
      .select()
      .single();

    if (error) {
      console.error('Error creating content schedule:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating content schedule:', error);
    throw error;
  }
}

export async function updateContentSchedule(id: string, schedule: Partial<ContentScheduleFormData>): Promise<OniAgenciaContentSchedule> {
  try {
    const { data, error } = await supabase
      .from(ONI_AGENCIA_CONTENT_SCHEDULES_TABLE)
      .update(schedule)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating content schedule:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating content schedule:', error);
    throw error;
  }
}

export async function deleteContentSchedule(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(ONI_AGENCIA_CONTENT_SCHEDULES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content schedule:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting content schedule:', error);
    throw error;
  }
}
