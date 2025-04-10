
import { supabase } from "@/integrations/supabase/client";
import { ClientScope, ClientScopeFormData } from "@/types/oni-agencia";

export async function getClientScopes(): Promise<ClientScope[]> {
  const { data, error } = await supabase
    .from('oni_agencia_client_scopes')
    .select('*')
    .order('created_at') as { data: ClientScope[] | null; error: any };

  if (error) {
    console.error('Error fetching client scopes:', error);
    throw error;
  }

  return data || [];
}

export async function getClientScopesByClient(clientId: string): Promise<ClientScope[]> {
  const { data, error } = await supabase
    .from('oni_agencia_client_scopes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at') as { data: ClientScope[] | null; error: any };

  if (error) {
    console.error('Error fetching client scopes by client:', error);
    throw error;
  }

  return data || [];
}

export async function createClientScope(scope: ClientScopeFormData): Promise<ClientScope> {
  try {
    const { data, error } = await supabase
      .from('oni_agencia_client_scopes')
      .insert(scope as any)
      .select()
      .single() as { data: ClientScope | null; error: any };

    if (error) {
      console.error('Error creating client scope:', error);
      throw error;
    }

    return data as ClientScope;
  } catch (error) {
    console.error('Error creating client scope:', error);
    throw error;
  }
}

export async function updateClientScope(id: string, scope: Partial<ClientScopeFormData>): Promise<ClientScope> {
  try {
    const { data, error } = await supabase
      .from('oni_agencia_client_scopes')
      .update(scope as any)
      .eq('id', id)
      .select()
      .single() as { data: ClientScope | null; error: any };

    if (error) {
      console.error('Error updating client scope:', error);
      throw error;
    }

    return data as ClientScope;
  } catch (error) {
    console.error('Error updating client scope:', error);
    throw error;
  }
}

export async function deleteClientScope(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('oni_agencia_client_scopes')
      .delete()
      .eq('id', id) as { error: any };

    if (error) {
      console.error('Error deleting client scope:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting client scope:', error);
    throw error;
  }
}
