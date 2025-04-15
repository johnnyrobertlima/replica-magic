
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
    
    // Construir condições para a consulta em lotes
    const conditions = [];
    
    if (searchTerm) {
      // Como não podemos usar .or() diretamente, precisamos de uma abordagem diferente
      // para consultas em lotes. Vamos buscar com cada critério separadamente e combinar depois.
      const itemsData1 = await fetchInBatches<any>(
        async (offset, limit) => {
          return await supabase
            .from("BLUEBAY_ITEM")
            .select("*")
            .ilike("ITEM_CODIGO", `%${searchTerm}%`)
            .order("DESCRICAO")
            .range(offset, offset + limit - 1);
        },
        5000
      );
      
      // Depois DESCRICAO
      const itemsData2 = await fetchInBatches<any>(
        async (offset, limit) => {
          return await supabase
            .from("BLUEBAY_ITEM")
            .select("*")
            .ilike("DESCRICAO", `%${searchTerm}%`)
            .order("DESCRICAO")
            .range(offset, offset + limit - 1);
        },
        5000
      );
      
      // Por fim CODIGOAUX
      const itemsData3 = await fetchInBatches<any>(
        async (offset, limit) => {
          return await supabase
            .from("BLUEBAY_ITEM")
            .select("*")
            .ilike("CODIGOAUX", `%${searchTerm}%`)
            .order("DESCRICAO")
            .range(offset, offset + limit - 1);
        },
        5000
      );
      
      // Combina todos os resultados e remove duplicatas pelo ITEM_CODIGO
      const allItems = [...itemsData1, ...itemsData2, ...itemsData3];
      const uniqueItemsMap = new Map();
      
      allItems.forEach(item => {
        if (item && item.ITEM_CODIGO && !uniqueItemsMap.has(item.ITEM_CODIGO)) {
          uniqueItemsMap.set(item.ITEM_CODIGO, item);
        }
      });
      
      return Array.from(uniqueItemsMap.values());
    } else {
      // Se não há busca por texto, podemos usar fetchInBatches diretamente
      const allItems = await fetchInBatches<any>(
        async (offset: number, limit: number) => {
          let query = supabase
            .from("BLUEBAY_ITEM")
            .select("*")
            .order("DESCRICAO")
            .range(offset, offset + limit - 1);
          
          if (groupFilter && groupFilter !== "all") {
            query = query.eq("GRU_CODIGO", groupFilter);
          }
          
          return await query;
        },
        5000
      );
      
      // Remover duplicatas pelo ITEM_CODIGO
      const uniqueItemsMap = new Map();
      allItems.forEach(item => {
        if (item && item.ITEM_CODIGO && !uniqueItemsMap.has(item.ITEM_CODIGO)) {
          uniqueItemsMap.set(item.ITEM_CODIGO, item);
        }
      });
      
      return Array.from(uniqueItemsMap.values());
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
