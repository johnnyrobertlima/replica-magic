
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../../errorHandlingService";

/**
 * Fetches cost data from the bluebay_view_faturamento_resumo view
 * This provides average cost (media_valor_unitario) and total quantity (total_quantidade)
 */
export const fetchCostDataFromView = async (): Promise<any[]> => {
  try {
    console.log("Buscando dados de custo médio da view bluebay_view_faturamento_resumo");
    
    // Query all data from the view without filtering
    const { data, error } = await supabase
      .from('bluebay_view_faturamento_resumo')
      .select('*');
      
    if (error) {
      throw new Error(`Erro ao consultar view de custos: ${error.message}`);
    }
    
    console.log(`Obtidos dados de custo para ${data?.length || 0} itens`);
    
    // Log a sample of the data to help with debugging
    if (data && data.length > 0) {
      console.log("Exemplo de dados retornados da view:", data[0]);
    }
    
    return data || [];
  } catch (error) {
    handleApiError("Erro ao buscar dados de custo da view", error);
    console.warn("Não foi possível obter dados de custo da view");
    return [];
  }
};

/**
 * Fetches cost data for a specific item from the bluebay_view_faturamento_resumo view
 */
export const fetchItemCostData = async (itemCode: string): Promise<any> => {
  try {
    console.log(`Buscando dados de custo para o item ${itemCode}`);
    
    const { data, error } = await supabase
      .from('bluebay_view_faturamento_resumo')
      .select('*')
      .eq('ITEM_CODIGO', itemCode)
      .single();
      
    if (error) {
      console.warn(`Erro ao buscar custo para o item ${itemCode}: ${error.message}`);
      return null;
    }
    
    console.log(`Dados de custo obtidos para o item ${itemCode}:`, data);
    return data;
  } catch (error) {
    console.error(`Erro ao buscar custo para o item ${itemCode}:`, error);
    return null;
  }
};
