
import { supabase } from "@/integrations/supabase/client";
import { fetchTitulosVencidos } from "@/utils/financialUtils";
import { clientCodeToString } from "@/utils/client-orders/clientUtils";

// Create a basic function to fetch orders for specific clients from Supabase
export const fetchOrdersForClients = async (clientIds: (string | number)[], fromDate: string, toDate: string) => {
  try {
    const clientIdsStrings = clientIds.map(id => clientCodeToString(id));
    
    const { data, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*, items:BLUEBAY_ITEMPEDIDO(*)')
      .in('PES_CODIGO', clientIdsStrings)
      .gte('DATAPED', fromDate)
      .lte('DATAPED', toDate);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return { success: false, error };
  }
};

// Function to fetch client financial information
export const fetchClientFinancialInfo = async (groupedOrders: Record<string, any>) => {
  const updatedGroups = { ...groupedOrders };
  
  for (const clientName in updatedGroups) {
    const group = updatedGroups[clientName];
    const clientCode = group.PES_CODIGO;
    
    if (clientCode) {
      try {
        // Fetch valores vencidos
        const valoresVencidos = await fetchTitulosVencidos(clientCode);
        updatedGroups[clientName].valoresVencidos = valoresVencidos;
        
        // Fetch volume saudável
        const { data: volumeData, error: volumeError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('volume_saudavel_faturamento')
          .eq('PES_CODIGO', clientCodeToString(clientCode))
          .single();
          
        if (!volumeError && volumeData) {
          updatedGroups[clientName].volumeSaudavel = volumeData.volume_saudavel_faturamento;
        }
      } catch (error) {
        console.error(`Erro ao buscar informações financeiras para ${clientName}:`, error);
      }
    }
  }
  
  return updatedGroups;
}
