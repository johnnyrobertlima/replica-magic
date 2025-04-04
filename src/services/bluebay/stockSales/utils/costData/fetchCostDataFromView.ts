
import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "../../errorHandlingService";

// Define a type for the cost data records to avoid type issues
interface CostDataRecord {
  ITEM_CODIGO: string;
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
      const targetItem = data.find(item => item.ITEM_CODIGO === 'MS-101/PB');
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
        const similarItems = data.filter(item => {
          const codigo = item.ITEM_CODIGO || '';
          return codigo.includes('MS-101');
        });
        
        if (similarItems.length > 0) {
          console.log("Items similares encontrados:", similarItems.map(i => i.ITEM_CODIGO));
        }
      }
    }
    
    return data as CostDataRecord[] || [];
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
    
    // Usar tipagem explícita para evitar inferência excessiva
    type QueryResponse = {
      data: CostDataRecord[] | null;
      error: any;
    };
    
    // Primeira tentativa: consulta com ITEM_CODIGO em maiúsculas (formato correto)
    const result: QueryResponse = await supabase
      .from('bluebay_view_faturamento_resumo')
      .select('*')
      .eq('ITEM_CODIGO', cleanedItemCode);
      
    if (result.error) {
      console.error(`Erro na consulta para o item ${cleanedItemCode}:`, result.error);
      return null;
    }
    
    if (!result.data || result.data.length === 0) {
      console.warn(`Nenhum resultado encontrado para o item ${cleanedItemCode} com ITEM_CODIGO maiúsculo`);
      
      // Segunda tentativa: consulta com item_codigo em minúsculas
      const altQuery: QueryResponse = await supabase
        .from('bluebay_view_faturamento_resumo')
        .select('*')
        .eq('item_codigo', cleanedItemCode);
      
      if (altQuery.error || !altQuery.data || altQuery.data.length === 0) {
        console.warn(`Nenhum resultado encontrado para o item ${cleanedItemCode} com item_codigo minúsculo`);
        
        // Tentar buscar por aproximação (LIKE) se as buscas exatas falharem
        const fuzzyQuery: QueryResponse = await supabase
          .from('bluebay_view_faturamento_resumo')
          .select('*')
          .ilike('ITEM_CODIGO', `%${cleanedItemCode}%`);
          
        if (!fuzzyQuery.error && fuzzyQuery.data && fuzzyQuery.data.length > 0) {
          console.log(`Encontrados ${fuzzyQuery.data.length} resultados com busca aproximada para ${cleanedItemCode}`);
          console.log('Primeiro resultado aproximado:', fuzzyQuery.data[0]);
          
          // Verificar se algum dos resultados corresponde exatamente ao código
          const exactMatch = fuzzyQuery.data.find(
            item => item.ITEM_CODIGO && item.ITEM_CODIGO.trim() === cleanedItemCode
          );
          
          if (exactMatch) {
            console.log(`Correspondência exata encontrada na busca aproximada:`, exactMatch);
            return exactMatch;
          }
          
          // Se não houver correspondência exata, usar o primeiro resultado
          return fuzzyQuery.data[0];
        }
        
        console.warn(`Nenhum resultado encontrado para o item ${cleanedItemCode} após todas as tentativas`);
        return null;
      }
      
      console.log(`Dados obtidos com consulta alternativa (minúsculas):`, altQuery.data[0]);
      
      // Verificar especificamente o valor do custo médio
      const altData = altQuery.data[0];
      if (altData) {
        if ('media_valor_unitario' in altData) {
          console.log(`Valor de media_valor_unitario: ${altData.media_valor_unitario}`);
        } else if ('MEDIA_VALOR_UNITARIO' in altData) {
          console.log(`Valor de MEDIA_VALOR_UNITARIO: ${altData.MEDIA_VALOR_UNITARIO}`);
        }
      }
      
      return altData;
    }
    
    console.log(`Dados de custo obtidos para o item ${cleanedItemCode}:`, result.data[0]);
    
    // Verificar especificamente o valor do custo médio
    const itemData = result.data[0];
    if (itemData) {
      if ('media_valor_unitario' in itemData) {
        console.log(`Valor de media_valor_unitario: ${itemData.media_valor_unitario}`);
      } else if ('MEDIA_VALOR_UNITARIO' in itemData) {
        console.log(`Valor de MEDIA_VALOR_UNITARIO: ${itemData.MEDIA_VALOR_UNITARIO}`);
      }
    }
    
    return itemData;
  } catch (error) {
    console.error(`Erro ao buscar custo para o item ${itemCode}:`, error);
    return null;
  }
};
