
import { supabase } from "@/integrations/supabase/client";
import type { EstoqueItemResult } from "../types";

/**
 * Fetches available stock for the specified items
 * Uses the optimized database function and handles large datasets with batching
 */
export async function fetchEstoqueParaItens(itemCodigos: string[]) {
  if (!itemCodigos.length) return [];
  
  try {
    console.log(`Buscando estoque para ${itemCodigos.length} itens`);
    
    // For large number of items, process in batches to avoid query parameter limitations
    const batchSize = 500; // Most databases have limits on the number of parameters
    const batches = [];
    
    for (let i = 0; i < itemCodigos.length; i += batchSize) {
      batches.push(itemCodigos.slice(i, i + batchSize));
    }
    
    console.log(`Processando consulta de estoque em ${batches.length} lotes`);
    
    let allResults: EstoqueItemResult[] = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Processando lote ${i+1}/${batches.length} com ${batch.length} itens`);
      
      // Use the correct function name as a string literal for the RPC call
      const { data, error } = await supabase.rpc('get_estoque_para_itens', {
        item_codigos: batch
      }) as { data: EstoqueItemResult[] | null, error: any };

      if (error) {
        console.error(`Erro ao buscar estoque para os itens no lote ${i+1}:`, error);
        throw error;
      }
      
      if (data) {
        allResults = [...allResults, ...data];
        console.log(`Lote ${i+1}: Obtidos dados de estoque para ${data.length} itens`);
      }
    }
    
    console.log(`Encontrados dados de estoque para ${allResults.length} itens no total`);
    return allResults;
  } catch (error) {
    console.error('Erro ao buscar estoque para os itens:', error);
    throw error;
  }
}
