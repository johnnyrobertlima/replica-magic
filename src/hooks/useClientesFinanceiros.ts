
import { useQuery } from "@tanstack/react-query";
import { fetchClient, fetchClientsByIds } from "@/services/financialService";
import { loadClientFinancialData } from "@/utils/financialUtils";
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
        
        // Ensure we have all required fields and proper types
        const fullCliente: ClienteFinanceiro = {
          // Required fields
          PES_CODIGO: cliente?.PES_CODIGO || String(clienteId),
          APELIDO: cliente?.APELIDO || null,
          volume_saudavel_faturamento: cliente?.volume_saudavel_faturamento || null,
          valoresTotais: financialData.valoresTotais || 0,
          valoresEmAberto: financialData.valoresEmAberto || 0,
          valoresVencidos: financialData.valoresVencidos || 0,
          separacoes: [],
          representanteNome: null,
          
          // Optional fields from cliente
          ...cliente,
        };
        
        return fullCliente;
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
            const financialData = await loadClientFinancialData(cliente.PES_CODIGO || "");
            
            // Construct a properly typed ClienteFinanceiro object
            const enrichedClient: ClienteFinanceiro = {
              PES_CODIGO: String(cliente.PES_CODIGO || ""),
              APELIDO: cliente.APELIDO || null,
              volume_saudavel_faturamento: cliente.volume_saudavel_faturamento || null,
              valoresTotais: financialData.valoresTotais,
              valoresEmAberto: financialData.valoresEmAberto,
              valoresVencidos: financialData.valoresVencidos,
              separacoes: [],
              representanteNome: null,
              ...cliente, // Include all other optional fields
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
