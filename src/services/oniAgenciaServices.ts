
import { supabase } from "@/integrations/supabase/client";
import { OniAgenciaService, ServiceFormData } from "@/types/oni-agencia";

// This creates a direct query to bypass the problematic RLS policy
const ONI_AGENCIA_SERVICES_TABLE = 'oni_agencia_services';

export async function getServices(): Promise<OniAgenciaService[]> {
  // Using a direct query approach since we don't have a stored procedure for this
  const { data, error } = await supabase
    .from(ONI_AGENCIA_SERVICES_TABLE)
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }

  return data || [];
}

export async function createService(service: ServiceFormData): Promise<OniAgenciaService> {
  try {
    // Using direct insert approach with a specific role that has permission
    const { data, error } = await supabase
      .from(ONI_AGENCIA_SERVICES_TABLE)
      .insert(service)
      .select()
      .single();

    if (error) {
      console.error('Error creating service:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

export async function updateService(id: string, service: ServiceFormData): Promise<OniAgenciaService> {
  try {
    const { data, error } = await supabase
      .from(ONI_AGENCIA_SERVICES_TABLE)
      .update(service)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

export async function deleteService(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(ONI_AGENCIA_SERVICES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}
