import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { fetchInBatches } from "@/services/bluebay/utils/batchFetchUtils";

// Cache para grupos (não muda com frequência)
let groupsCache: any[] | null = null;
// Cache para empresas (não muda com frequência)
let empresasCache: string[] | null = null;

/**
 * Fetches active groups from the bluebay_grupo_item_view
 */
export const fetchGroups = async () => {
  console.log("Fetching active groups from bluebay_grupo_item_view...");
  
  try {
    const { data, error } = await supabase
      .from("bluebay_grupo_item_view")
      .select("id, gru_codigo, gru_descricao, empresa_nome, empresa_id")
      .eq("ativo", true)
      .eq("empresa_nome", "Bluebay") // Filter groups by company = Bluebay
      .order("gru_descricao");

    if (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }

    // Make sure we sanitize the data to prevent empty string values
    // and remove duplicate groups by using a Map with a composite key of gru_codigo+gru_descricao
    const groupsMap = new Map();
    
    data?.forEach(group => {
      if (!group.gru_codigo) {
        // Fallback for empty string
        group.gru_codigo = `group-${group.id}`;
      }
      
      // Create a composite key using both code and description to ensure uniqueness
      const key = `${group.gru_codigo}|${group.gru_descricao}`;
      
      // Only add if not already in the map
      if (!groupsMap.has(key)) {
        groupsMap.set(key, group);
      }
    });
    
    // Convert Map back to array
    const sanitizedData = Array.from(groupsMap.values());

    console.log(`Found ${sanitizedData.length || 0} unique active groups from ${data?.length || 0} total groups`);
    return sanitizedData;
  } catch (error) {
    console.error("Error fetching groups:", error);
    return []; // Return empty array in case of error
  }
};

/**
 * Busca todas as empresas distintas dos grupos ativos
 */
export const fetchEmpresas = async () => {
  // Verificamos se temos as empresas em cache
  if (empresasCache !== null) {
    console.log("Usando empresas em cache:", empresasCache.length);
    return empresasCache;
  }

  console.log("Buscando empresas de grupos ativos...");
  
  try {
    // Buscar empresas dos grupos ativos
    const { data, error } = await supabase
      .from("bluebay_grupo_item_view")
      .select("empresa_nome")
      .eq("ativo", true)
      .not("empresa_nome", "is", null);

    if (error) {
      console.error("Erro ao buscar empresas:", error);
      throw error;
    }

    console.log(`Total de registros com dados de empresa: ${data?.length}`);

    // Extrair valores únicos de empresa
    const empresasSet = new Set<string>();
    
    if (data) {
      data.forEach(item => {
        if (item.empresa_nome && item.empresa_nome.trim()) {
          empresasSet.add(item.empresa_nome.trim());
        }
      });
    }
    
    // Converter Set para array
    const uniqueEmpresas = Array.from(empresasSet);
    
    console.log(`Total de empresas únicas após processamento: ${uniqueEmpresas.length}`);
    
    // Ordenar por nome de empresa
    uniqueEmpresas.sort((a, b) => a.localeCompare(b));

    // Salvar em cache
    empresasCache = uniqueEmpresas;
    
    return empresasCache;
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    return []; // Retornar array vazio em caso de erro
  }
};

export const fetchItems = async (
  searchTerm: string,
  groupFilter: string,
  empresaFilter: string,
  page: number,
  pageSize: number
) => {
  // Calculate range based on current page and page size
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Get active Bluebay groups
  const bluebayGroupCodes = await getBluebayGroupCodes();
  
  // Build our query
  let query = supabase
    .from("BLUEBAY_ITEM")
    .select("*", { count: "exact" })
    .eq("ativo", true); // Only fetch active items

  // Filter by Bluebay group codes
  if (bluebayGroupCodes.length > 0) {
    query = query.in("GRU_CODIGO", bluebayGroupCodes);
  } else {
    // If no Bluebay groups found, return empty result
    return { items: [], count: 0 };
  }

  // Apply additional filters
  if (searchTerm) {
    query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
  }

  if (groupFilter && groupFilter !== "all") {
    query = query.eq("GRU_CODIGO", groupFilter);
  }

  // Apply empresa filter if selected
  if (empresaFilter && empresaFilter !== "all") {
    query = query.eq("empresa", empresaFilter);
  }

  // Apply pagination and ordering after filters
  query = query.order("DESCRICAO").range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  
  // Ensure we only include items with Bluebay group codes
  const uniqueItemsMap = new Map();
  if (data) {
    for (const item of data) {
      // Only include items whose groups are in bluebayGroupCodes
      if (bluebayGroupCodes.includes(item.GRU_CODIGO)) {
        if (!uniqueItemsMap.has(item.ITEM_CODIGO)) {
          uniqueItemsMap.set(item.ITEM_CODIGO, item);
        }
      }
    }
  }
  
  const uniqueItems = Array.from(uniqueItemsMap.values());
  
  return { 
    items: uniqueItems, 
    count: count // Use the count from the query
  };
};

/**
 * Get all Bluebay group codes from bluebay_grupo_item_view
 */
const getBluebayGroupCodes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("bluebay_grupo_item_view")
      .select("gru_codigo")
      .eq("ativo", true)
      .eq("empresa_nome", "Bluebay");

    if (error) {
      console.error("Error fetching Bluebay group codes:", error);
      return [];
    }

    return data.map(group => group.gru_codigo).filter(Boolean);
  } catch (error) {
    console.error("Error in getBluebayGroupCodes:", error);
    return [];
  }
};

/**
 * Get all active group codes from bluebay_grupo_item_view
 */
const getActiveGroupCodes = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("bluebay_grupo_item_view")
      .select("gru_codigo")
      .eq("ativo", true);

    if (error) {
      console.error("Error fetching active group codes:", error);
      return [];
    }

    return data.map(group => group.gru_codigo);
  } catch (error) {
    console.error("Error in getActiveGroupCodes:", error);
    return [];
  }
};

// Função para buscar todos os itens sem limitação (usando batches)
export const fetchAllItems = async (
  searchTerm?: string,
  groupFilter?: string,
  empresaFilter?: string
): Promise<any[]> => {
  try {
    console.log("Iniciando busca de todos os itens em lotes de 1000");
    
    // Get Bluebay groups to filter items
    const bluebayGroupCodes = await getBluebayGroupCodes();
    
    if (bluebayGroupCodes.length === 0) {
      console.log("Nenhum grupo Bluebay encontrado para filtrar itens");
      return [];
    }
    
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
            let query = supabase
              .from("BLUEBAY_ITEM")
              .select("*", { count: "exact", head: false })
              .eq("ativo", true) // Only fetch active items
              .in("GRU_CODIGO", bluebayGroupCodes) // Filter by Bluebay group codes
              .ilike(field, `%${term}%`)
              .order("DESCRICAO")
              .range(offset, offset + limit - 1)
              .throwOnError();
            
            if (groupFilter && groupFilter !== "all") {
              query = query.eq("GRU_CODIGO", groupFilter);
            }
            
            if (empresaFilter && empresaFilter !== "all") {
              query = query.eq("empresa", empresaFilter);
            }
            
            return await query;
          },
          1000 // Reduzir para 1000 registros por lote
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
      // Usar fetchInBatches para carregar todos os códigos de estoque
      console.log("Buscando todos os códigos de itens do estoque com LOCAL = 1");
      
      const itemCodes = await fetchInBatches<{ITEM_CODIGO: string}>(
        async (offset: number, limit: number) => {
          return await supabase
            .from("BLUEBAY_ESTOQUE")
            .select("ITEM_CODIGO", { count: "exact", head: false })
            .eq("LOCAL", 1)
            .range(offset, offset + limit - 1)
            .throwOnError();
        },
        1000 // Reduzir para 1000 registros por lote
      );
      
      console.log(`Total de ${itemCodes.length} códigos de itens encontrados no estoque`);
      
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
        
        let query = supabase
          .from("BLUEBAY_ITEM")
          .select("*", { count: "exact", head: false })
          .eq("ativo", true) // Only fetch active items
          .in("ITEM_CODIGO", codeBatch)
          .in("GRU_CODIGO", bluebayGroupCodes) // Filter by Bluebay group codes
          .throwOnError();
        
        if (groupFilter && groupFilter !== "all") {
          query = query.eq("GRU_CODIGO", groupFilter);
        }
        
        if (empresaFilter && empresaFilter !== "all") {
          query = query.eq("empresa", empresaFilter);
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
