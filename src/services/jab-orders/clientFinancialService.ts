
import { supabase } from "@/integrations/supabase/client";
import { fetchTitulosVencidos } from "@/utils/financialUtils";
import { clientCodeToString, clientCodeToNumber } from "@/utils/client-orders/clientUtils";

export const fetchClientFinancialInfo = async (groupedOrders: Record<string, any>) => {
  const updatedGroups = { ...groupedOrders };
  
  for (const clientName in updatedGroups) {
    const group = updatedGroups[clientName];
    const clientCode = group.PES_CODIGO;
    
    if (clientCode) {
      try {
        const clientCodeStr = clientCodeToString(clientCode);
        const clientCodeNum = clientCodeToNumber(clientCode);
        
        // Fetch valores vencidos
        const valoresVencidos = await fetchTitulosVencidos(clientCodeStr);
        updatedGroups[clientName].valoresVencidos = valoresVencidos;
        
        // Fetch volume saudável
        const { data: volumeData, error: volumeError } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('volume_saudavel_faturamento')
          .eq('PES_CODIGO', clientCodeStr)
          .maybeSingle();
          
        if (!volumeError && volumeData) {
          updatedGroups[clientName].volumeSaudavel = volumeData.volume_saudavel_faturamento;
        }
      } catch (error) {
        console.error(`Erro ao buscar informações financeiras para ${clientName}:`, error);
      }
    }
  }
  
  return updatedGroups;
};
