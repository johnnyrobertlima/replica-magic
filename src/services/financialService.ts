
import { supabase } from "@/integrations/supabase/client";
import type { ClienteFinanceiro } from "@/types/financialClient";

// Fetch a single client by ID
export const fetchClient = async (clientId: number | string) => {
  // Convert to string for the query as PES_CODIGO is stored as text
  const clientIdStr = String(clientId);
  
  const { data, error } = await supabase
    .from("BLUEBAY_PESSOA")
    .select(`
      PES_CODIGO, 
      APELIDO, 
      RAZAOSOCIAL, 
      EMAIL, 
      TELEFONE, 
      CIDADE, 
      UF, 
      volume_saudavel_faturamento,
      BAIRRO, 
      CATEGORIA, 
      CEP, 
      CNPJCPF, 
      COMPLEMENTO, 
      DATACADASTRO, 
      ENDERECO, 
      INSCRICAO_ESTADUAL, 
      NOME_CATEGORIA, 
      NUMERO
    `)
    .eq("PES_CODIGO", clientIdStr)
    .maybeSingle();

  if (error) throw error;
  
  // Cast the data to ClienteFinanceiro, but only for the fields returned by the query
  return data as Partial<ClienteFinanceiro>;
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
  // Convert all IDs to strings for the query
  const clientIdStrings = clientIds.map(id => String(id));
  
  if (clientIdStrings.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("BLUEBAY_PESSOA")
    .select(`
      PES_CODIGO, 
      APELIDO, 
      RAZAOSOCIAL, 
      EMAIL, 
      TELEFONE, 
      CIDADE, 
      UF, 
      volume_saudavel_faturamento,
      BAIRRO, 
      CATEGORIA, 
      CEP, 
      CNPJCPF, 
      COMPLEMENTO, 
      DATACADASTRO, 
      ENDERECO, 
      INSCRICAO_ESTADUAL, 
      NOME_CATEGORIA, 
      NUMERO
    `)
    .in("PES_CODIGO", clientIdStrings);

  if (error) throw error;
  
  // Cast the data to ClienteFinanceiro[], but only for the fields returned by the query
  return (data || []) as Partial<ClienteFinanceiro>[];
};

// Fetch all clients
export const fetchAllClients = async () => {
  const { data, error } = await supabase
    .from("BLUEBAY_PESSOA")
    .select(`
      PES_CODIGO, 
      APELIDO, 
      RAZAOSOCIAL, 
      EMAIL, 
      TELEFONE, 
      CIDADE, 
      UF, 
      volume_saudavel_faturamento
    `);

  if (error) throw error;
  return data || [];
};

// Fetch clients by name search
export const fetchClientsByName = async (search: string) => {
  const { data, error } = await supabase
    .from("BLUEBAY_PESSOA")
    .select(`
      PES_CODIGO, 
      APELIDO, 
      RAZAOSOCIAL, 
      EMAIL, 
      TELEFONE, 
      CIDADE, 
      UF, 
      volume_saudavel_faturamento
    `)
    .ilike("APELIDO", `%${search}%`);

  if (error) throw error;
  return data || [];
};

// Fetch clients by rep ID(s)
export const fetchClientsByRepIds = async (repIds: (number | string)[]) => {
  // Convert rep IDs to strings for the query
  const repIdStrings = repIds.map(id => String(id));
  
  if (repIdStrings.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("BLUEBAY_PESSOA")
    .select(`
      PES_CODIGO, 
      APELIDO, 
      RAZAOSOCIAL, 
      EMAIL, 
      TELEFONE, 
      CIDADE, 
      UF, 
      volume_saudavel_faturamento
    `)
    .in("REP_CODIGO", repIdStrings);

  if (error) throw error;
  return data || [];
};
