
import { supabase } from "@/integrations/supabase/client";
import { ClienteFinanceiro } from "@/types/financialClient";

// Fetch a single client by ID
export const fetchClient = async (clientId: number | string) => {
  // Convert to number if it's a string
  const numericClientId = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;
  
  // Check if the ID is valid
  if (isNaN(numericClientId)) {
    throw new Error(`Invalid client ID: ${clientId}`);
  }

  const { data, error } = await supabase
    .from("BLUEBAY_PESSOA")
    .select("*")
    .eq("PES_CODIGO", numericClientId)
    .single();

  if (error) throw error;
  return data as unknown as ClienteFinanceiro;
};

// Process client data to add calculated properties
export const processClientsData = (clients: any[]) => {
  return clients.map(client => ({
    ...client,
    valoresTotais: parseFloat((client.valoresTotais || 0).toFixed(2)),
    valoresEmAberto: parseFloat((client.valoresEmAberto || 0).toFixed(2)),
    valoresVencidos: parseFloat((client.valoresVencidos || 0).toFixed(2)),
  }));
};

// Fetch multiple clients by their IDs
export const fetchClientsByIds = async (clientIds: (number | string)[]) => {
  // Convert array of potentially string IDs to numbers
  const numericClientIds = clientIds.map(id => 
    typeof id === 'string' ? parseInt(id, 10) : id
  ).filter(id => !isNaN(id));
  
  if (numericClientIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("BLUEBAY_PESSOA")
    .select("*")
    .in("PES_CODIGO", numericClientIds);

  if (error) throw error;
  return data || [];
};

// Fetch all clients
export const fetchAllClients = async () => {
  const { data, error } = await supabase
    .from("BLUEBAY_PESSOA")
    .select("*");

  if (error) throw error;
  return data || [];
};

// Fetch clients by name search
export const fetchClientsByName = async (search: string) => {
  const { data, error } = await supabase
    .from("BLUEBAY_PESSOA")
    .select("*")
    .ilike("APELIDO", `%${search}%`);

  if (error) throw error;
  return data || [];
};

// Fetch clients by rep ID(s)
export const fetchClientsByRepIds = async (repIds: (number | string)[]) => {
  // Convert array of potentially string IDs to numbers
  const numericRepIds = repIds.map(id => 
    typeof id === 'string' ? parseInt(id, 10) : id
  ).filter(id => !isNaN(id));
  
  if (numericRepIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("BLUEBAY_PESSOA")
    .select("*")
    .in("REP_CODIGO", numericRepIds);

  if (error) throw error;
  return data || [];
};
