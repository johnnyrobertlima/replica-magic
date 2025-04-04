
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../../errorHandlingService";

// Define a proper interface for the cost data records to avoid type issues
interface CostDataRecord {
  ITEM_CODIGO?: string;
  item_codigo?: string;
  media_valor_unitario?: number;
  MEDIA_VALOR_UNITARIO?: number;
  total_quantidade?: number;
  TOTAL_QUANTIDADE?: number;
  [key: string]: any; // Allow other properties
}

/**
 * Fetches cost data from the bluebay_view_faturamento_resumo view
 * This provides average cost (media_valor_unitario) and total quantity (total_quantidade)
 */
export const fetchCostDataFromView = async (): Promise<CostDataRecord[]> => {
  try {
    console.log("Buscando dados de custo médio da view bluebay_view_faturamento_resumo");
    
    // Query all data from the view without filtering - use explicit typing
    const response = await supabase
      .from('bluebay_view_faturamento_resumo')
      .select('*');
      
    const { data, error } = response;
      
    if (error) {
      throw new Error(`Erro ao consultar view de custos: ${error.message}`);
    }
    
    console.log(`Obtidos dados de custo para ${data?.length || 0} itens`);
    
    // Log a sample of the data to help with debugging
    if (data && data.length > 0) {
      console.log("Exemplo de dados retornados da view:", data[0]);
      
      // Check if the field names match what we expect
      const firstItem = data[0] as Record<string, any>;
      const keys = Object.keys(firstItem);
      console.log("Campos disponíveis na view:", keys);
      
      // Log exact field names to confirm case sensitivity
      if ('media_valor_unitario' in firstItem) {
        console.log("Campo media_valor_unitario encontrado com valor:", firstItem.media_valor_unitario);
      } else if ('MEDIA_VALOR_UNITARIO' in firstItem) {
        console.log("Campo MEDIA_VALOR_UNITARIO encontrado com valor:", firstItem.MEDIA_VALOR_UNITARIO);
      } else {
        console.log("Campo de custo médio não encontrado no formato esperado");
        
        // Try to locate a field that might contain the cost data
        const potentialCostField = keys.find(key => 
          key.toLowerCase().includes('valor') || 
          key.toLowerCase().includes('media') || 
          key.toLowerCase().includes('custo')
        );
        
        if (potentialCostField) {
          console.log(`Campo potencial para custo médio: ${potentialCostField} = ${firstItem[potentialCostField]}`);
        }
      }

      // Busca específica pelo item MS-101/PB para diagnóstico
      const targetItem = data.find((item: Record<string, any>) => {
        const itemCode = item.ITEM_CODIGO || item.item_codigo;
        return itemCode === 'MS-101/PB' || 
               (typeof itemCode === 'string' && itemCode.trim() === 'MS-101/PB');
      });
      
      if (targetItem) {
        console.log("*** ITEM ESPECÍFICO ENCONTRADO: MS-101/PB ***");
        console.log("Dados completos do item na view:", targetItem);
        
        // Verificar todos os campos que podem conter o valor do custo
        Object.keys(targetItem).forEach(key => {
          if (key.toLowerCase().includes('valor') || 
              key.toLowerCase().includes('media') || 
              key.toLowerCase().includes('custo')) {
            console.log(`Campo ${key}: ${targetItem[key]}`);
          }
        });
      } else {
        console.log("*** ITEM MS-101/PB NÃO ENCONTRADO NA VIEW ***");
        
        // Tentar buscar nomes similares
        const similarItems = data.filter((item: Record<string, any>) => {
          const codigo = item.ITEM_CODIGO || item.item_codigo || '';
          return typeof codigo === 'string' && codigo.includes('MS-101');
        });
        
        if (similarItems.length > 0) {
          console.log("Items similares encontrados:", similarItems.map(i => i.ITEM_CODIGO || i.item_codigo));
        }
      }
    }
    
    // Ensure we return an array of CostDataRecord objects
    return (data && Array.isArray(data)) ? data.map((item: any) => item as CostDataRecord) : [];
  } catch (error) {
    handleApiError("Erro ao buscar dados de custo da view", error);
    console.warn("Não foi possível obter dados de custo da view");
    return [];
  }
};

/**
 * Fetches cost data for a specific item from the bluebay_view_faturamento_resumo view
 */
export const fetchItemCostData = async (itemCode: string): Promise<CostDataRecord | null> => {
  try {
    console.log(`Buscando dados de custo para o item "${itemCode}"`);
    
    // Limpar possíveis espaços ou caracteres ocultos no código do item
    const cleanedItemCode = itemCode.trim();
    
    // Tentativa 1: Busca exata com ITEM_CODIGO (maiúsculo)
    const exactResult = await supabase
      .from('bluebay_view_faturamento_resumo')
      .select('*')
      .eq('ITEM_CODIGO', cleanedItemCode);
      
    if (exactResult.error) {
      console.error(`Erro na consulta para o item ${cleanedItemCode}:`, exactResult.error);
      return null;
    }
    
    if (exactResult.data && exactResult.data.length > 0) {
      console.log(`Dados obtidos para o item ${cleanedItemCode}:`, exactResult.data[0]);
      
      // Verificar o campo de custo
      const exactData = exactResult.data[0] as Record<string, any>;
      if ('media_valor_unitario' in exactData && exactData.media_valor_unitario) {
        console.log(`Valor de media_valor_unitario: ${exactData.media_valor_unitario}`);
      } else if ('MEDIA_VALOR_UNITARIO' in exactData && exactData.MEDIA_VALOR_UNITARIO) {
        console.log(`Valor de MEDIA_VALOR_UNITARIO: ${exactData.MEDIA_VALOR_UNITARIO}`);
      }
      
      return exactData as unknown as CostDataRecord;
    }
    
    console.warn(`Nenhum resultado encontrado para o item ${cleanedItemCode} com ITEM_CODIGO maiúsculo`);
    
    // Tentativa 2: Busca com item_codigo (minúsculo)
    const lowerResult = await supabase
      .from('bluebay_view_faturamento_resumo')
      .select('*')
      .eq('item_codigo', cleanedItemCode);
    
    if (lowerResult.error) {
      console.error(`Erro na consulta alternativa para o item ${cleanedItemCode}:`, lowerResult.error);
    } else if (lowerResult.data && lowerResult.data.length > 0) {
      console.log(`Dados obtidos com consulta alternativa (minúsculas):`, lowerResult.data[0]);
      
      // Verificar o campo de custo
      const lowerData = lowerResult.data[0] as Record<string, any>;
      if ('media_valor_unitario' in lowerData && lowerData.media_valor_unitario) {
        console.log(`Valor de media_valor_unitario: ${lowerData.media_valor_unitario}`);
      } else if ('MEDIA_VALOR_UNITARIO' in lowerData && lowerData.MEDIA_VALOR_UNITARIO) {
        console.log(`Valor de MEDIA_VALOR_UNITARIO: ${lowerData.MEDIA_VALOR_UNITARIO}`);
      }
      
      return lowerData as unknown as CostDataRecord;
    }
    
    console.warn(`Nenhum resultado encontrado para o item ${cleanedItemCode} com item_codigo minúsculo`);
    
    // Tentativa 3: Busca aproximada (LIKE)
    const fuzzyResult = await supabase
      .from('bluebay_view_faturamento_resumo')
      .select('*')
      .ilike('ITEM_CODIGO', `%${cleanedItemCode}%`);
      
    if (fuzzyResult.error) {
      console.error(`Erro na busca aproximada para o item ${cleanedItemCode}:`, fuzzyResult.error);
      return null;
    }
    
    if (fuzzyResult.data && fuzzyResult.data.length > 0) {
      console.log(`Encontrados ${fuzzyResult.data.length} resultados com busca aproximada para ${cleanedItemCode}`);
      
      // Verificar se algum dos resultados corresponde exatamente ao código (ignorando espaços)
      const exactMatch = fuzzyResult.data.find(
        (item: Record<string, any>) => {
          const dbItemCode = item.ITEM_CODIGO || '';
          return typeof dbItemCode === 'string' && dbItemCode.trim() === cleanedItemCode;
        }
      );
      
      if (exactMatch) {
        console.log(`Correspondência exata encontrada na busca aproximada:`, exactMatch);
        return exactMatch as unknown as CostDataRecord;
      }
      
      // Retornar o primeiro resultado aproximado se não houver correspondência exata
      console.log(`Usando primeiro resultado aproximado:`, fuzzyResult.data[0]);
      return fuzzyResult.data[0] as unknown as CostDataRecord;
    }
    
    console.warn(`Nenhum resultado encontrado para o item ${cleanedItemCode} após todas as tentativas`);
    return null;
  } catch (error) {
    console.error(`Erro ao buscar custo para o item ${itemCode}:`, error);
    return null;
  }
};
