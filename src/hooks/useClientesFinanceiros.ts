
import { useQuery } from "@tanstack/react-query";
import { 
  fetchClient, 
  fetchAllClients,
  fetchClientsByIds,
  fetchClientsByName,
  fetchClientsByRepIds
} from "@/services/financialService";
import { loadClientFinancialData, fetchTitulosVencidos } from "@/utils/financialUtils";
import type { ClienteFinanceiro } from "@/types/financialClient";

// Get a single client by ID
export const useClienteFinanceiro = (clienteId: number | string | undefined) => {
  return useQuery({
    queryKey: ["cliente-financeiro", clienteId],
    queryFn: async () => {
      if (!clienteId) return null;
      
      try {
        // Fetch basic client data
        const cliente = await fetchClient(clienteId);
        
        // Load financial data
        const financialData = await loadClientFinancialData(clienteId);
        
        // Ensure PES_CODIGO is properly set as a number
        const pesCodigoNumeric = typeof cliente.PES_CODIGO === 'string' 
          ? parseInt(cliente.PES_CODIGO, 10) 
          : cliente.PES_CODIGO;
          
        // Return combined data with default empty values for required fields
        return {
          ...cliente,
          PES_CODIGO: pesCodigoNumeric,
          ...financialData,
          separacoes: [],  // Default empty array for separacoes
          representanteNome: null  // Default null for representanteNome
        } as ClienteFinanceiro;
      } catch (error) {
        console.error("Error fetching cliente financeiro:", error);
        throw error;
      }
    },
    enabled: !!clienteId,
  });
};

// Get multiple clients by their IDs
export const useClientesFinanceirosByIds = (clienteIds: (number | string)[]) => {
  return useQuery({
    queryKey: ["clientes-financeiros-by-ids", clienteIds],
    queryFn: async () => {
      if (!clienteIds.length) return [];
      
      try {
        const clientes = await fetchClientsByIds(clienteIds);
        
        // Enrich with financial data
        const clientesEnriquecidos = await Promise.all(
          clientes.map(async (cliente) => {
            const financialData = await loadClientFinancialData(cliente.PES_CODIGO);
            
            // Ensure PES_CODIGO is a number
            const pesCodigoNumeric = typeof cliente.PES_CODIGO === 'string' 
              ? parseInt(cliente.PES_CODIGO, 10) 
              : cliente.PES_CODIGO;
            
            // Construct a properly typed ClienteFinanceiro object
            const enrichedClient: ClienteFinanceiro = {
              ...cliente,
              PES_CODIGO: pesCodigoNumeric,
              valoresTotais: financialData.valoresTotais,
              valoresEmAberto: financialData.valoresEmAberto,
              valoresVencidos: financialData.valoresVencidos,
              separacoes: [],  // Default empty array
              representanteNome: null  // Default null
            };
            
            return enrichedClient;
          })
        );
        
        return clientesEnriquecidos;
      } catch (error) {
        console.error("Error fetching clientes financeiros by ids:", error);
        throw error;
      }
    },
    enabled: clienteIds.length > 0,
  });
};

// Get all clients
export const useAllClientesFinanceiros = () => {
  return useQuery({
    queryKey: ["all-clientes-financeiros"],
    queryFn: async () => {
      try {
        const clientes = await fetchAllClients();
        return clientes;
      } catch (error) {
        console.error("Error fetching all clientes financeiros:", error);
        throw error;
      }
    },
  });
};

// Search clients by name
export const useClientesFinanceirosByName = (searchQuery: string) => {
  return useQuery({
    queryKey: ["clientes-financeiros-by-name", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      
      try {
        const clientes = await fetchClientsByName(searchQuery);
        return clientes;
      } catch (error) {
        console.error("Error searching clientes financeiros by name:", error);
        throw error;
      }
    },
    enabled: !!searchQuery,
  });
};

// Get clients by representante IDs
export const useClientesFinanceirosByRepIds = (repIds: (number | string)[]) => {
  return useQuery({
    queryKey: ["clientes-financeiros-by-rep-ids", repIds],
    queryFn: async () => {
      if (!repIds.length) return [];
      
      try {
        const clientes = await fetchClientsByRepIds(repIds);
        return clientes;
      } catch (error) {
        console.error("Error fetching clientes financeiros by rep ids:", error);
        throw error;
      }
    },
    enabled: repIds.length > 0,
  });
};
