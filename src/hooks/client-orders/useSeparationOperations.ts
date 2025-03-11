
import { useQueryClient } from "@tanstack/react-query";
import { sendOrdersForSeparation } from "@/services/clientSeparationService";
import type { ClientOrdersState } from "@/types/clientOrders";
import type { ClienteFinanceiro } from "@/types/financialClient";

export const useSeparationOperations = (
  state: ClientOrdersState,
  setState: React.Dispatch<React.SetStateAction<ClientOrdersState>>,
  groupedOrders: Record<string, any>
) => {
  const queryClient = useQueryClient();
  const { selectedItems } = state;

  const handleEnviarParaSeparacao = async () => {
    setState(prev => ({ ...prev, isSending: true }));
    
    try {
      if (Object.keys(groupedOrders).length === 0 || selectedItems.length === 0) {
        console.error("No orders or no items selected");
        return;
      }
      
      // Get the client name and data
      const clientName = Object.keys(groupedOrders)[0] || '';
      const clientData = groupedOrders[clientName];
      
      if (!clientData) {
        console.error("No client data found");
        return;
      }
      
      // Create a proper ClienteFinanceiro object from the groupedOrders
      const clienteFinanceiro: ClienteFinanceiro = {
        PES_CODIGO: Number(clientData.clientId || 0),
        APELIDO: clientName,
        volume_saudavel_faturamento: clientData.volumeSaudavel || null,
        valoresTotais: clientData.valoresTotais || 0,
        valoresEmAberto: clientData.valoresEmAberto || 0,
        valoresVencidos: clientData.valoresVencidos || 0,
        separacoes: [{ separacao_itens: clientData.allItems || [] }],
        representanteNome: clientData.representanteNome || null
      };

      const result = await sendOrdersForSeparation(selectedItems, clienteFinanceiro);
      
      if (result.success) {
        await queryClient.invalidateQueries({ queryKey: ['separacoes'] });
        await queryClient.invalidateQueries({ queryKey: ['jabOrders'] });
        
        setState(prev => ({ 
          ...prev, 
          selectedItems: [],
          selectedItemsDetails: {},
          expandedClients: new Set()
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isSending: false }));
    }
  };

  return {
    handleEnviarParaSeparacao
  };
};
