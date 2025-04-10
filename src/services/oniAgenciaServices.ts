
import { supabase } from "@/integrations/supabase/client";
import { OniAgenciaService, ServiceFormData } from "@/types/oni-agencia";

export async function getServices(): Promise<OniAgenciaService[]> {
  const { data, error } = await supabase
    .from('oni_agencia_services')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }

  return data || [];
}

export async function createService(service: ServiceFormData): Promise<OniAgenciaService> {
  const { data, error } = await supabase
    .from('oni_agencia_services')
    .insert(service)
    .select()
    .single();

  if (error) {
    console.error('Error creating service:', error);
    throw error;
  }

  return data;
}

export async function updateService(id: string, service: ServiceFormData): Promise<OniAgenciaService> {
  const { data, error } = await supabase
    .from('oni_agencia_services')
    .update(service)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating service:', error);
    throw error;
  }

  return data;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase
    .from('oni_agencia_services')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}
