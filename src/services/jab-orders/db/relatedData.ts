
import { supabase } from "@/integrations/supabase/client";
import { batchArray } from "../utils";

export async function fetchRelatedData(pessoasIds: number[], itemCodigos: string[]) {
  if (!pessoasIds.length || !itemCodigos.length) {
    return {
      pessoas: [],
      itens: [],
      estoque: []
    };
  }
  
  const batchSizePessoas = 100;
  const batchSizeItens = 100;
  const pessoasBatches = batchArray(pessoasIds, batchSizePessoas);
  const itensBatches = batchArray(itemCodigos, batchSizeItens);
  
  // Busca pessoas
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
  
  // Busca itens
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
  
  // Busca estoque
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

  return {
    pessoas: allPessoas,
    itens: allItens,
    estoque: allEstoque
  };
}
