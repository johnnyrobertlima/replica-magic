
import { supabase } from "@/integrations/supabase/client";
import { CostDataRecord } from "./costDataTypes";

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
      
      // Use simple Record type to avoid deep instantiation
      const exactData = exactResult.data[0] as Record<string, any>;
      if ('media_valor_unitario' in exactData && exactData.media_valor_unitario) {
        console.log(`Valor de media_valor_unitario: ${exactData.media_valor_unitario}`);
      } else if ('MEDIA_VALOR_UNITARIO' in exactData && exactData.MEDIA_VALOR_UNITARIO) {
        console.log(`Valor de MEDIA_VALOR_UNITARIO: ${exactData.MEDIA_VALOR_UNITARIO}`);
      }
      
      return exactData;
    }
    
    console.warn(`Nenhum resultado encontrado para o item ${cleanedItemCode} com ITEM_CODIGO maiúsculo`);
    
    // Tentativa 2: Busca com item_codigo (minúsculo)
    const lowerResult = await tryAlternativeFieldName(cleanedItemCode);
    if (lowerResult) return lowerResult;
    
    // Tentativa 3: Busca aproximada (LIKE)
    return await tryFuzzySearch(cleanedItemCode);
    
  } catch (error) {
    console.error(`Erro ao buscar custo para o item ${itemCode}:`, error);
    return null;
  }
};

/**
 * Try searching with lowercase field name
 */
async function tryAlternativeFieldName(itemCode: string): Promise<CostDataRecord | null> {
  const lowerResult = await supabase
    .from('bluebay_view_faturamento_resumo')
    .select('*')
    .eq('item_codigo', itemCode);
  
  if (lowerResult.error) {
    console.error(`Erro na consulta alternativa para o item ${itemCode}:`, lowerResult.error);
    return null;
  } 
  
  if (lowerResult.data && lowerResult.data.length > 0) {
    console.log(`Dados obtidos com consulta alternativa (minúsculas):`, lowerResult.data[0]);
    
    // Simple Record type to avoid deep instantiation
    const lowerData = lowerResult.data[0] as Record<string, any>;
    if ('media_valor_unitario' in lowerData && lowerData.media_valor_unitario) {
      console.log(`Valor de media_valor_unitario: ${lowerData.media_valor_unitario}`);
    } else if ('MEDIA_VALOR_UNITARIO' in lowerData && lowerData.MEDIA_VALOR_UNITARIO) {
      console.log(`Valor de MEDIA_VALOR_UNITARIO: ${lowerData.MEDIA_VALOR_UNITARIO}`);
    }
    
    return lowerData;
  }
  
  console.warn(`Nenhum resultado encontrado para o item ${itemCode} com item_codigo minúsculo`);
  return null;
}

/**
 * Try fuzzy search with LIKE operator
 */
async function tryFuzzySearch(itemCode: string): Promise<CostDataRecord | null> {
  const fuzzyResult = await supabase
    .from('bluebay_view_faturamento_resumo')
    .select('*')
    .ilike('ITEM_CODIGO', `%${itemCode}%`);
    
  if (fuzzyResult.error) {
    console.error(`Erro na busca aproximada para o item ${itemCode}:`, fuzzyResult.error);
    return null;
  }
  
  if (fuzzyResult.data && fuzzyResult.data.length > 0) {
    console.log(`Encontrados ${fuzzyResult.data.length} resultados com busca aproximada para ${itemCode}`);
    
    // Verificar se algum dos resultados corresponde exatamente ao código (ignorando espaços)
    const exactMatch = fuzzyResult.data.find(
      (item) => {
        const dbItemCode = item.ITEM_CODIGO || '';
        return typeof dbItemCode === 'string' && dbItemCode.trim() === itemCode;
      }
    );
    
    if (exactMatch) {
      console.log(`Correspondência exata encontrada na busca aproximada:`, exactMatch);
      return exactMatch;
    }
    
    // Retornar o primeiro resultado aproximado se não houver correspondência exata
    console.log(`Usando primeiro resultado aproximado:`, fuzzyResult.data[0]);
    return fuzzyResult.data[0];
  }
  
  console.warn(`Nenhum resultado encontrado para o item ${itemCode} após todas as tentativas`);
  return null;
}
