
import { supabase } from "@/integrations/supabase/client";
import { OniAgenciaClient, ClientFormData } from "@/types/oni-agencia";

const ONI_AGENCIA_CLIENTS_TABLE = 'oni_agencia_clients';

export async function getClients(): Promise<OniAgenciaClient[]> {
  const { data, error } = await supabase
    .from(ONI_AGENCIA_CLIENTS_TABLE)
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  return data || [];
}

export async function createClient(client: ClientFormData): Promise<OniAgenciaClient> {
  try {
    const { data, error } = await supabase
      .from(ONI_AGENCIA_CLIENTS_TABLE)
      .insert(client)
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
}

export async function updateClient(id: string, client: ClientFormData): Promise<OniAgenciaClient> {
  try {
    const { data, error } = await supabase
      .from(ONI_AGENCIA_CLIENTS_TABLE)
      .update(client)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
}

export async function deleteClient(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(ONI_AGENCIA_CLIENTS_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}
