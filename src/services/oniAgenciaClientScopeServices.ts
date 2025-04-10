
import { supabase } from "@/integrations/supabase/client";
import { ClientScope, ClientScopeFormData } from "@/types/oni-agencia";

const ONI_AGENCIA_CLIENT_SCOPES_TABLE = 'oni_agencia_client_scopes';

export async function getClientScopes(): Promise<ClientScope[]> {
  const { data, error } = await supabase
    .from(ONI_AGENCIA_CLIENT_SCOPES_TABLE)
    .select('*')
    .order('created_at');

  if (error) {
    console.error('Error fetching client scopes:', error);
    throw error;
  }

  return data || [];
}

export async function getClientScopesByClient(clientId: string): Promise<ClientScope[]> {
  const { data, error } = await supabase
    .from(ONI_AGENCIA_CLIENT_SCOPES_TABLE)
    .select('*')
    .eq('client_id', clientId)
    .order('created_at');

  if (error) {
    console.error('Error fetching client scopes by client:', error);
    throw error;
  }

  return data || [];
}

export async function createClientScope(scope: ClientScopeFormData): Promise<ClientScope> {
  try {
    const { data, error } = await supabase
      .from(ONI_AGENCIA_CLIENT_SCOPES_TABLE)
      .insert(scope)
      .select()
      .single();

    if (error) {
      console.error('Error creating client scope:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating client scope:', error);
    throw error;
  }
}

export async function updateClientScope(id: string, scope: Partial<ClientScopeFormData>): Promise<ClientScope> {
  try {
    const { data, error } = await supabase
      .from(ONI_AGENCIA_CLIENT_SCOPES_TABLE)
      .update(scope)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client scope:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating client scope:', error);
    throw error;
  }
}

export async function deleteClientScope(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from(ONI_AGENCIA_CLIENT_SCOPES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client scope:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting client scope:', error);
    throw error;
  }
}
