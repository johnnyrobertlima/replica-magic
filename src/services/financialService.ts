
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
  
  // Ensure PES_CODIGO is a string
  return data ? {
    ...data,
    PES_CODIGO: String(data.PES_CODIGO)
  } as Partial<ClienteFinanceiro> : null;
};

// Process client data to add calculated properties
export const processClientsData = (clients: any[]) => {
  return clients.map(client => ({
    ...client,
    PES_CODIGO: String(client.PES_CODIGO),
    valoresTotais: parseFloat((client.valoresTotais || 0).toFixed(2)),
    valoresEmAberto: parseFloat((client.valoresEmAberto || 0).toFixed(2)),
    valoresVencidos: parseFloat((client.valoresVencidos || 0).toFixed(2)),
  }));
};

// Fetch multiple clients by their IDs
export const fetchClientsByIds = async (clientIds: (number | string)[]) => {
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
  
  // Convert PES_CODIGO to string for each client
  return (data || []).map(client => ({
    ...client,
    PES_CODIGO: String(client.PES_CODIGO)
  })) as Partial<ClienteFinanceiro>[];
};
