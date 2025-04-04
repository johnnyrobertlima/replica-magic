
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../../errorHandlingService";

/**
 * Fetches cost data from the bluebay_view_faturamento_resumo view
 * This provides average cost (media_valor_unitario) and total quantity (total_quantidade)
 */
export const fetchCostDataFromView = async (): Promise<any[]> => {
  try {
    console.log("Buscando dados de custo médio da view bluebay_view_faturamento_resumo");
    
    // Use 'from' with a string cast to handle the view that's not in the TypeScript definitions
    const { data, error } = await supabase
      .from('bluebay_view_faturamento_resumo' as any)
      .select('ITEM_CODIGO, media_valor_unitario, total_quantidade');
      
    if (error) {
      throw new Error(`Erro ao consultar view de custos: ${error.message}`);
    }
    
    console.log(`Obtidos dados de custo para ${data?.length || 0} itens`);
    return data || [];
  } catch (error) {
    handleApiError("Erro ao buscar dados de custo da view", error);
    console.warn("Não foi possível obter dados de custo da view");
    return [];
  }
};
