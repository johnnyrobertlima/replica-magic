import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { fetchInBatches } from "@/services/bluebay/utils/batchFetchUtils";

// Cache para grupos (não muda com frequência)
let groupsCache: any[] | null = null;

export const fetchItems = async (
  searchTerm: string,
  groupFilter: string,
  page: number,
  pageSize: number
) => {
  // Calculate range based on current page and page size
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Build our query
  let query = supabase
    .from("BLUEBAY_ITEM")
    .select("*", { count: "exact" });

  // Apply filters
  if (searchTerm) {
    query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
  }

  if (groupFilter && groupFilter !== "all") {
    query = query.eq("GRU_CODIGO", groupFilter);
  }

  // Apply pagination and ordering after filters
  query = query.order("DESCRICAO").range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  
  // Get unique items (no duplicates)
  const uniqueItemsMap = new Map();
  if (data) {
    data.forEach(item => {
      if (!uniqueItemsMap.has(item.ITEM_CODIGO)) {
        uniqueItemsMap.set(item.ITEM_CODIGO, item);
      }
    });
  }
  
  const uniqueItems = Array.from(uniqueItemsMap.values());
  
  return { 
    items: uniqueItems, 
    count: count || 0 
  };
};

// Função para buscar todos os itens sem limitação (usando batches)
export const fetchAllItems = async (
  searchTerm?: string,
  groupFilter?: string
): Promise<any[]> => {
  try {
    console.log("Iniciando busca de todos os itens em lotes");
    
    // Usar um tamanho de lote apropriado
    const batchSize = 1000; // Usar 1000 que é o limite padrão do Supabase
    
    if (searchTerm) {
      // Para buscas com termo, usamos uma abordagem diferentes para garantir resultados completos
      console.log(`Buscando por texto: "${searchTerm}" em todos os itens`);
      
      // Array para guardar todas as consultas que faremos
      const searchQueries = [
        { field: "ITEM_CODIGO", term: searchTerm },
        { field: "DESCRICAO", term: searchTerm },
        { field: "CODIGOAUX", term: searchTerm }
      ];
      
      // Conjunto para controlar itens já processados e evitar duplicatas
      const processedItemCodes = new Set<string>();
      let totalItems: any[] = [];
      
      // Para cada campo de busca, executamos o carregamento em lotes
      for (const { field, term } of searchQueries) {
        console.log(`Buscando itens por ${field} contendo "${term}"`);
        
        const itemsData = await fetchInBatches<any>(
          async (offset: number, limit: number) => {
            const query = supabase
              .from("BLUEBAY_ITEM")
              .select("*", { count: "exact", head: false })
              .ilike(field, `%${term}%`)
              .order("DESCRICAO")
              .range(offset, offset + limit - 1)
              .throwOnError();
            
            if (groupFilter && groupFilter !== "all") {
              query.eq("GRU_CODIGO", groupFilter);
            }
            
            return await query;
          },
          batchSize
        );
        
        console.log(`Encontrados ${itemsData.length} itens por ${field}`);
        
        // Adiciona os novos itens que ainda não foram processados
        let newItemsAdded = 0;
        
        for (const item of itemsData) {
          if (item && item.ITEM_CODIGO && !processedItemCodes.has(item.ITEM_CODIGO)) {
            totalItems.push(item);
            processedItemCodes.add(item.ITEM_CODIGO);
            newItemsAdded++;
          }
        }
        
        console.log(`Adicionados ${newItemsAdded} novos itens únicos por ${field} (total acumulado: ${processedItemCodes.size})`);
      }
      
      console.log(`Total final após busca por texto: ${totalItems.length} itens únicos`);
      return totalItems;
    } else {
      // Abordagem 1: Buscar itens diretamente do estoque
      console.log("Buscando todos os itens diretamente do ESTOQUE com LOCAL = 1");
      
      // Primeiro buscamos todos os códigos dos itens do estoque com LOCAL = 1
      console.log(`Buscando todos os códigos de itens do estoque...`);
      
      const { data: itemCodes, error: itemCodesError, count: totalItemsCount } = await supabase
        .from("BLUEBAY_ESTOQUE")
        .select("ITEM_CODIGO", { count: "exact", head: false })
        .eq("LOCAL", 1);

      if (itemCodesError) {
        console.error("Erro ao buscar códigos de itens:", itemCodesError);
        throw itemCodesError;
      }

      console.log(`Total de ${totalItemsCount || itemCodes.length} códigos de itens encontrados no estoque`);
      
      // Extrair códigos únicos
      const uniqueItemCodesSet = new Set<string>();
      itemCodes.forEach(item => {
        if (item && item.ITEM_CODIGO) {
          uniqueItemCodesSet.add(item.ITEM_CODIGO);
        }
      });
      
      const uniqueItemCodes = Array.from(uniqueItemCodesSet);
      console.log(`Total de ${uniqueItemCodes.length} códigos únicos de itens extraídos`);
      
      // Buscar todos os itens em lotes
      let allItems: any[] = [];
      const codeBatchSize = 500; // Tamanho do lote para consultas IN
      const totalBatches = Math.ceil(uniqueItemCodes.length / codeBatchSize);
      
      console.log(`Dividindo ${uniqueItemCodes.length} códigos em ${totalBatches} lotes para busca de detalhes`);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIdx = batchIndex * codeBatchSize;
        const endIdx = Math.min(startIdx + codeBatchSize, uniqueItemCodes.length);
        const codeBatch = uniqueItemCodes.slice(startIdx, endIdx);
        
        console.log(`Processando lote ${batchIndex + 1}/${totalBatches} com ${codeBatch.length} códigos`);
        
        // Buscar detalhes dos itens no lote atual
        const query = supabase
          .from("BLUEBAY_ITEM")
          .select("*", { count: "exact", head: false })
          .in("ITEM_CODIGO", codeBatch)
          .throwOnError();
        
        if (groupFilter && groupFilter !== "all") {
          query.eq("GRU_CODIGO", groupFilter);
        }
        
        const { data: batchItems, error: batchError, count: batchCount } = await query;
        
        if (batchError) {
          console.error(`Erro ao buscar lote ${batchIndex + 1}:`, batchError);
          continue; // Continue para o próximo lote em caso de erro
        }
        
        console.log(`Lote ${batchIndex + 1}: Encontrados ${batchItems.length} de ${batchCount} itens possíveis`);
        allItems = [...allItems, ...batchItems];
        
        console.log(`Progresso: ${allItems.length}/${uniqueItemCodes.length} itens (${Math.round((allItems.length / uniqueItemCodes.length) * 100)}%)`);
      }
      
      // Verificar itens duplicados
      console.log(`Verificando duplicatas no conjunto final de ${allItems.length} itens`);
      const uniqueItemsMap = new Map<string, any>();
      let duplicateCount = 0;
      
      allItems.forEach(item => {
        if (item && item.ITEM_CODIGO) {
          if (!uniqueItemsMap.has(item.ITEM_CODIGO)) {
            uniqueItemsMap.set(item.ITEM_CODIGO, item);
          } else {
            duplicateCount++;
          }
        }
      });
      
      if (duplicateCount > 0) {
        console.log(`Removidas ${duplicateCount} duplicatas na fase final`);
      }
      
      const finalItems = Array.from(uniqueItemsMap.values());
      console.log(`Total final: ${finalItems.length} itens únicos carregados com sucesso`);
      
      return finalItems;
    }
  } catch (error) {
    console.error("Erro ao buscar todos os itens:", error);
    throw error;
  }
};

export const fetchGroups = async () => {
  // Verificamos se temos os grupos em cache
  if (groupsCache !== null) {
    return groupsCache;
  }

  // Get unique groups from items
  const { data, error } = await supabase
    .from("BLUEBAY_ITEM")
    .select("GRU_CODIGO, GRU_DESCRICAO")
    .not("GRU_CODIGO", "is", null)
    .order("GRU_DESCRICAO");

  if (error) throw error;

  // Remove duplicates
  const uniqueGroups = data?.reduce((acc: any[], curr) => {
    if (!acc.some(group => group.GRU_CODIGO === curr.GRU_CODIGO) && curr.GRU_CODIGO) {
      acc.push(curr);
    }
    return acc;
  }, []);

  // Salvar em cache
  groupsCache = uniqueGroups || [];
  
  return groupsCache;
};

export const saveItem = async (itemData: any, isUpdate: boolean) => {
  try {
    // Clean up UUID fields to prevent the "invalid input syntax for type uuid" error
    const cleanedItemData = {
      ...itemData,
      id_subcategoria: itemData.id_subcategoria || null,
      id_marca: itemData.id_marca || null
    };

    if (isUpdate) {
      const { error } = await supabase
        .from("BLUEBAY_ITEM")
        .update({
          DESCRICAO: cleanedItemData.DESCRICAO,
          GRU_CODIGO: cleanedItemData.GRU_CODIGO,
          GRU_DESCRICAO: cleanedItemData.GRU_DESCRICAO,
          CODIGOAUX: cleanedItemData.CODIGOAUX,
          id_subcategoria: cleanedItemData.id_subcategoria,
          id_marca: cleanedItemData.id_marca,
          empresa: cleanedItemData.empresa,
          estacao: cleanedItemData.estacao,
          genero: cleanedItemData.genero,
          faixa_etaria: cleanedItemData.faixa_etaria,
          ativo: cleanedItemData.ativo,
          ncm: cleanedItemData.ncm
        })
        .eq("ITEM_CODIGO", cleanedItemData.ITEM_CODIGO);

      if (error) throw error;
      
      return { success: true, message: "O item foi atualizado com sucesso." };
    } else {
      // For new items, include current date and default values for MATRIZ and FILIAL
      const { error } = await supabase
        .from("BLUEBAY_ITEM")
        .insert({
          ITEM_CODIGO: cleanedItemData.ITEM_CODIGO,
          DESCRICAO: cleanedItemData.DESCRICAO,
          GRU_CODIGO: cleanedItemData.GRU_CODIGO,
          GRU_DESCRICAO: cleanedItemData.GRU_DESCRICAO,
          CODIGOAUX: cleanedItemData.CODIGOAUX,
          id_subcategoria: cleanedItemData.id_subcategoria,
          id_marca: cleanedItemData.id_marca,
          empresa: cleanedItemData.empresa,
          estacao: cleanedItemData.estacao,
          genero: cleanedItemData.genero,
          faixa_etaria: cleanedItemData.faixa_etaria,
          ativo: cleanedItemData.ativo,
          ncm: cleanedItemData.ncm,
          DATACADASTRO: new Date().toISOString(),
          MATRIZ: 1, // Required for foreign key constraint
          FILIAL: 1  // Required for foreign key constraint
        });

      if (error) throw error;
      
      return { success: true, message: "O item foi cadastrado com sucesso." };
    }
  } finally {
    // Limpar o cache de grupos quando salvarmos um item
    // pois pode ter sido adicionado um novo grupo
    groupsCache = null;
  }
};

export const deleteItem = async (itemCode: string) => {
  try {
    // First delete any variations that might exist for this item
    await supabase
      .from("BLUEBAY_ITEM_VARIACAO")
      .delete()
      .eq("item_codigo", itemCode);
      
    // Then delete the item itself
    const { error } = await supabase
      .from("BLUEBAY_ITEM")
      .delete()
      .eq("ITEM_CODIGO", itemCode);

    if (error) throw error;
    
    return { success: true, message: "O item foi excluído com sucesso." };
  } finally {
    // Limpar o cache de grupos quando excluirmos um item
    // pois pode ser que tenhamos removido um grupo
    groupsCache = null;
  }
};

// Function to verify if an item exists before creating variations
export const verifyItemExists = async (itemCode: string): Promise<boolean> => {
  if (!itemCode) return false;
  
  try {
    console.log(`Checking if item exists: ${itemCode}`);
    
    const { data, error } = await supabase
      .from("BLUEBAY_ITEM")
      .select("ITEM_CODIGO, MATRIZ, FILIAL")
      .eq("ITEM_CODIGO", itemCode)
      .limit(1);

    if (error) {
      console.error("Error verifying item existence:", error);
      return false;
    }

    const exists = Array.isArray(data) && data.length > 0;
    console.log(`Item ${itemCode} exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error("Exception checking item existence:", error);
    return false;
  }
};

// Função para obter um item completo, incluindo matriz e filial
export const getItemWithMatrizFilial = async (itemCode: string): Promise<{
  ITEM_CODIGO: string;
  MATRIZ: number;
  FILIAL: number;
} | null> => {
  if (!itemCode) return null;
  
  try {
    const { data, error } = await supabase
      .from("BLUEBAY_ITEM")
      .select("ITEM_CODIGO, MATRIZ, FILIAL")
      .eq("ITEM_CODIGO", itemCode)
      .limit(1);

    if (error) {
      console.error("Error fetching item details:", error);
      return null;
    }

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    return null;
  } catch (error) {
    console.error("Exception fetching item details:", error);
    return null;
  }
};
