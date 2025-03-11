
import { 
  fetchClient, 
  fetchAllClients,
  fetchClientsByIds,
  fetchClientsByName,
  fetchClientsByRepIds,
  processClientsData
} from '@/services/financialService';
import { supabase } from "@/integrations/supabase/client";
import type { ClienteFinanceiro } from "@/types/financialClient";

/**
 * Calculate valores vencidos (past due balance) for a client
 */
export const calcularValoresVencidos = (titulos: any[], today: Date): number => {
  return titulos
    .filter(titulo => {
      const dtVencimento = titulo.DTVENCIMENTO ? new Date(titulo.DTVENCIMENTO) : null;
      return dtVencimento && dtVencimento < today && titulo.VLRSALDO > 0;
    })
    .reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0);
};

export const loadClientFinancialData = async (clientId: number | string) => {
  try {
    const numericClientId = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;
    
    // Convert numericClientId to string for the query as PES_CODIGO appears to be stored as text in the database
    const clientIdStr = String(numericClientId);
    
    const { data: titulos = [], error } = await supabase
      .from("BLUEBAY_TITULO")
      .select("*")
      .eq("PES_CODIGO", clientIdStr);
    
    if (error) throw error;
    
    const today = new Date();
    
    const valoresTotais = titulos.reduce((acc, titulo) => acc + (titulo.VLRTITULO || 0), 0);
    const valoresEmAberto = titulos.reduce((acc, titulo) => acc + (titulo.VLRSALDO || 0), 0);
    const valoresVencidos = calcularValoresVencidos(titulos, today);
    
    return {
      valoresTotais,
      valoresEmAberto,
      valoresVencidos
    };
  } catch (error) {
    console.error("Error loading client financial data:", error);
    return {
      valoresTotais: 0,
      valoresEmAberto: 0,
      valoresVencidos: 0
    };
  }
};

export const getSeparacoesPendentes = (separacoes: any[], hiddenCards: Set<string>) => {
  return separacoes.filter(sep => !hiddenCards.has(sep.id));
};

export const getClientesCodigos = (separacoes: any[]) => {
  return Array.from(new Set(separacoes.map(sep => sep.cliente_codigo)));
};

export const updateVolumeSaudavel = async (clienteCodigo: number | string, valor: number) => {
  try {
    // Ensure clienteCodigo is converted to string for the query
    const clienteCodigoStr = String(clienteCodigo);
    
    const { data, error } = await supabase
      .from('BLUEBAY_PESSOA')
      .update({ volume_saudavel_faturamento: valor })
      .eq('PES_CODIGO', clienteCodigoStr)
      .select();

    if (error) {
      console.error("Erro ao atualizar o volume saudável:", error);
      return { success: false, error: error };
    }

    return { success: true, data: data };
  } catch (error) {
    console.error("Erro ao atualizar o volume saudável:", error);
    return { success: false, error: error };
  }
};

export const fetchTitulosVencidos = async (clientId: number | string) => {
  try {
    // Convert to string for the query as PES_CODIGO is stored as text
    const clientIdStr = String(clientId);
    
    let { data, error } = await supabase
      .from('BLUEBAY_TITULO')
      .select('*')
      .eq('PES_CODIGO', clientIdStr)
      .lt('DTVENCIMENTO', new Date().toISOString());

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching titulos vencidos:', error);
    return [];
  }
};

export const getClientById = async (clientId: number | string) => {
  try {
    const numericClientId = typeof clientId === 'string' ? parseInt(clientId, 10) : clientId;
    
    if (isNaN(numericClientId)) {
      throw new Error(`Invalid client ID: ${clientId}`);
    }
    
    const { data, error } = await supabase
      .from("BLUEBAY_PESSOA")
      .select("*")
      .eq("PES_CODIGO", String(numericClientId))
      .single();
      
    if (error) throw error;
    return data as unknown as ClienteFinanceiro;
  } catch (error) {
    console.error("Error fetching client data:", error);
    throw error;
  }
};
