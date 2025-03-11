
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
      // Create a proper ClienteFinanceiro object from the groupedOrders
      const clienteCodigo = Number(Object.values(groupedOrders)[0]?.PES_CODIGO || 0);
      const clienteNome = Object.keys(groupedOrders)[0] || '';
      const clienteData: ClienteFinanceiro = {
        PES_CODIGO: clienteCodigo,
        APELIDO: clienteNome,
        volume_saudavel_faturamento: null,
        valoresTotais: 0,
        valoresEmAberto: 0,
        valoresVencidos: 0,
        separacoes: [{ separacao_itens: Object.values(groupedOrders).flatMap(g => g.allItems || []) }],
        representanteNome: null
      };

      const result = await sendOrdersForSeparation(selectedItems, clienteData);
      
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
