
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches related data for the given person IDs, item codes, and representative codes
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
  
  const batchSizePessoas = 100;
  const batchSizeItens = 100;
  const batchSizeRepresentantes = 100;
  const pessoasBatches = [];
  const itensBatches = [];
  const representantesBatches = [];
  
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
  
  const allPessoas = [];
  for (const batch of pessoasBatches) {
    const { data } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO')
      .in('PES_CODIGO', batch);
    
    if (data) {
      allPessoas.push(...data);
    }
  }
  
  const allItens = [];
  for (const batch of itensBatches) {
    const { data } = await supabase
      .from('BLUEBAY_ITEM')
      .select('ITEM_CODIGO, DESCRICAO')
      .in('ITEM_CODIGO', batch);
    
    if (data) {
      allItens.push(...data);
    }
  }
  
  const allEstoque = [];
  for (const batch of itensBatches) {
    const { data } = await supabase
      .from('BLUEBAY_ESTOQUE')
      .select('ITEM_CODIGO, FISICO')
      .in('ITEM_CODIGO', batch);
    
    if (data) {
      allEstoque.push(...data);
    }
  }

  const allRepresentantes = [];
  if (representantesBatches.length > 0) {
    for (const batch of representantesBatches) {
      const { data } = await supabase
        .from('BLUEBAY_PESSOA')
        .select('PES_CODIGO, RAZAOSOCIAL')
        .in('PES_CODIGO', batch);
      
      if (data) {
        allRepresentantes.push(...data);
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
