
import { supabase } from "@/integrations/supabase/client";
import { ClientInfo } from "../types/financialTypes";

// Fetch client data in batch from Supabase
export const fetchClientData = async (clienteCodigos: number[]): Promise<Map<number, ClientInfo>> => {
  try {
    const { data: clientesData, error } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
      .in('PES_CODIGO', clienteCodigos);
    
    if (error) {
      console.error("Error fetching client data:", error);
      return new Map();
    }
    
    // Create a map for quick client lookup
    const clientesMap = new Map<number, ClientInfo>();
    clientesData?.forEach(cliente => {
      clientesMap.set(cliente.PES_CODIGO, {
        APELIDO: cliente.APELIDO,
        RAZAOSOCIAL: cliente.RAZAOSOCIAL
      });
    });
    
    return clientesMap;
  } catch (error) {
    console.error("Error in fetchClientData:", error);
    return new Map();
  }
};

// Get client name from the client info
export const getClientName = (
  clienteInfo: ClientInfo | undefined, 
  fallback = "Cliente não encontrado"
): string => {
  return clienteInfo?.APELIDO || clienteInfo?.RAZAOSOCIAL || fallback;
};

// Convert PES_CODIGO to number safely
export const pesCodigoToNumber = (pesCode: string | number): number => {
  return typeof pesCode === 'string' ? parseInt(pesCode, 10) : pesCode;
};
