
import { supabase } from "@/integrations/supabase/client";
import { ClientInfo } from "../types/financialTypes";

// Convert PES_CODIGO to number, handling both string and number inputs
export const pesCodigoToNumber = (pesCode: string | number | null): number => {
  if (pesCode === null) return 0;
  if (typeof pesCode === 'number') return pesCode;
  return parseInt(pesCode, 10) || 0;
};

// Get client name from client info, using appropriate fallbacks
export const getClientName = (clientInfo?: ClientInfo | null): string => {
  if (!clientInfo) return "Cliente não encontrado";
  return clientInfo.APELIDO || clientInfo.RAZAOSOCIAL || "Cliente não encontrado";
};

// Fetch client data from BLUEBAY_PESSOA table
export const fetchClientData = async (clienteCodigos: Array<string | number>): Promise<Map<number, ClientInfo>> => {
  const clientesMap = new Map<number, ClientInfo>();
  
  // Convert all client codes to string for query
  const clienteCodigosStr = clienteCodigos.map(String);
  
  if (clienteCodigosStr.length === 0) return clientesMap;
  
  try {
    const { data: clientes, error } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO, RAZAOSOCIAL')
      .in('PES_CODIGO', clienteCodigosStr);
    
    if (error) {
      console.error("Error fetching client data:", error);
      return clientesMap;
    }
    
    // Add each client to the map with numeric PES_CODIGO as key
    for (const cliente of clientes || []) {
      const numericCode = pesCodigoToNumber(cliente.PES_CODIGO);
      clientesMap.set(numericCode, {
        APELIDO: cliente.APELIDO,
        RAZAOSOCIAL: cliente.RAZAOSOCIAL
      });
    }
    
    return clientesMap;
  } catch (error) {
    console.error("Exception fetching client data:", error);
    return clientesMap;
  }
};
