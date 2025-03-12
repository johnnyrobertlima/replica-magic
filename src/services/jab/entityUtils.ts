
import { supabase } from "@/integrations/supabase/client";

/**
 * Delays execution for the specified milliseconds
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches related data for the given person IDs, item codes, and representative codes
 * with optimized batch processing to prevent resource exhaustion
 */
export async function fetchRelatedData(pessoasIds: number[], itemCodigos: string[], representantesCodigos: number[] = []) {
  if (!pessoasIds.length || !itemCodigos.length) {
    return {
      pessoas: [],
      itens: [],
      estoque: [],
      representantes: []
    };
  }
  
  // Smaller batch sizes to prevent resource exhaustion
  const batchSizePessoas = 5;
  const batchSizeItens = 5;
  const batchSizeRepresentantes = 5;
  const delayBetweenBatches = 300; // ms
  
  const pessoasBatches = [];
  const itensBatches = [];
  const representantesBatches = [];
  
  // Split into smaller batches
  for (let i = 0; i < pessoasIds.length; i += batchSizePessoas) {
    pessoasBatches.push(pessoasIds.slice(i, i + batchSizePessoas));
  }
  
  for (let i = 0; i < itemCodigos.length; i += batchSizeItens) {
    itensBatches.push(itemCodigos.slice(i, i + batchSizeItens));
  }

  if (representantesCodigos.length > 0) {
    for (let i = 0; i < representantesCodigos.length; i += batchSizeRepresentantes) {
      representantesBatches.push(representantesCodigos.slice(i, i + batchSizeRepresentantes));
    }
  }
  
  // Process batches with delays
  const allPessoas = [];
  for (const [index, batch] of pessoasBatches.entries()) {
    try {
      if (index > 0) await delay(delayBetweenBatches);
      
      console.log(`Fetching pessoas batch ${index + 1}/${pessoasBatches.length}`);
      const { data, error } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, APELIDO')
        .in('PES_CODIGO', batch);
      
      if (error) {
        console.error(`Erro ao buscar lote ${index + 1} de pessoas:`, error);
        continue; // Skip this batch but continue with others
      }
      
      if (data) {
        allPessoas.push(...data);
        console.log(`Received ${data.length} pessoas in batch ${index + 1}`);
      }
    } catch (error) {
      console.error(`Exception in pessoas batch ${index + 1}:`, error);
    }
  }
  
  const allItens = [];
  for (const [index, batch] of itensBatches.entries()) {
    try {
      if (index > 0) await delay(delayBetweenBatches);
      
      console.log(`Fetching itens batch ${index + 1}/${itensBatches.length}`);
      const { data, error } = await supabase
        .from('BLUEBAY_ITEM')
        .select('ITEM_CODIGO, DESCRICAO')
        .in('ITEM_CODIGO', batch);
      
      if (error) {
        console.error(`Erro ao buscar lote ${index + 1} de itens:`, error);
        continue;
      }
      
      if (data) {
        allItens.push(...data);
        console.log(`Received ${data.length} itens in batch ${index + 1}`);
      }
    } catch (error) {
      console.error(`Exception in itens batch ${index + 1}:`, error);
    }
  }
  
  // Combined estoque fetch with itens to reduce number of parallel requests
  const allEstoque = [];
  for (const [index, batch] of itensBatches.entries()) {
    try {
      if (index > 0) await delay(delayBetweenBatches);
      
      console.log(`Fetching estoque batch ${index + 1}/${itensBatches.length}`);
      const { data, error } = await supabase
        .from('BLUEBAY_ESTOQUE')
        .select('ITEM_CODIGO, FISICO')
        .in('ITEM_CODIGO', batch);
      
      if (error) {
        console.error(`Erro ao buscar lote ${index + 1} de estoque:`, error);
        continue;
      }
      
      if (data) {
        allEstoque.push(...data);
        console.log(`Received ${data.length} estoque items in batch ${index + 1}`);
      }
    } catch (error) {
      console.error(`Exception in estoque batch ${index + 1}:`, error);
    }
  }

  const allRepresentantes = [];
  if (representantesBatches.length > 0) {
    for (const [index, batch] of representantesBatches.entries()) {
      try {
        if (index > 0) await delay(delayBetweenBatches);
        
        console.log(`Fetching representantes batch ${index + 1}/${representantesBatches.length}`);
        const { data, error } = await supabase
          .from('BLUEBAY_PESSOA')
          .select('PES_CODIGO, RAZAOSOCIAL')
          .in('PES_CODIGO', batch);
        
        if (error) {
          console.error(`Erro ao buscar lote ${index + 1} de representantes:`, error);
          continue;
        }
        
        if (data) {
          allRepresentantes.push(...data);
          console.log(`Received ${data.length} representantes in batch ${index + 1}`);
        }
      } catch (error) {
        console.error(`Exception in representantes batch ${index + 1}:`, error);
      }
    }
  }

  return {
    pessoas: allPessoas,
    itens: allItens,
    estoque: allEstoque,
    representantes: allRepresentantes
  };
}
