
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
    
    let totalItems: any[] = [];
    let batchCount = 0;
    
    if (searchTerm) {
      // Como não podemos usar .or() diretamente, precisamos de uma abordagem diferente
      // para consultas em lotes. Vamos buscar com cada critério separadamente e combinar depois.
      console.log("Buscando por texto:", searchTerm);
      
      // Primeiro busca por ITEM_CODIGO
      console.log("Buscando itens por ITEM_CODIGO");
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
      console.log(`Encontrados ${itemsData1.length} itens por ITEM_CODIGO`);
      
      // Depois DESCRICAO
      console.log("Buscando itens por DESCRICAO");
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
      console.log(`Encontrados ${itemsData2.length} itens por DESCRICAO`);
      
      // Por fim CODIGOAUX
      console.log("Buscando itens por CODIGOAUX");
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
      console.log(`Encontrados ${itemsData3.length} itens por CODIGOAUX`);
      
      // Combina todos os resultados e remove duplicatas pelo ITEM_CODIGO
      const allItems = [...itemsData1, ...itemsData2, ...itemsData3];
      console.log(`Total bruto combinado: ${allItems.length} itens (pode conter duplicatas)`);
      
      const uniqueItemsMap = new Map();
      
      allItems.forEach(item => {
        if (item && item.ITEM_CODIGO && !uniqueItemsMap.has(item.ITEM_CODIGO)) {
          uniqueItemsMap.set(item.ITEM_CODIGO, item);
        } else if (item && item.ITEM_CODIGO) {
          console.log(`Skipping duplicate item: ${item.ITEM_CODIGO}`);
        }
      });
      
      totalItems = Array.from(uniqueItemsMap.values());
      console.log(`Total de itens únicos (após remoção de duplicatas): ${totalItems.length}`);
    } else {
      // Se não há busca por texto, buscamos diretamente do estoque para garantir que obtemos todos os itens
      console.log("Buscando todos os itens do estoque sem filtro de texto");
      
      // Busca todos os itens de estoque com LOCAL = 1
      const estoqueItems = await fetchInBatches<any>(
        async (offset: number, limit: number) => {
          let query = supabase
            .from("BLUEBAY_ESTOQUE")
            .select("ITEM_CODIGO")
            .eq("LOCAL", 1)
            .range(offset, offset + limit - 1);
          
          return await query;
        },
        5000
      );
      
      console.log(`Encontrados ${estoqueItems.length} itens de estoque (LOCAL = 1)`);
      
      // Extrai os códigos dos itens
      const itemCodigos = estoqueItems
        .filter(item => item && item.ITEM_CODIGO)
        .map(item => item.ITEM_CODIGO);
      
      console.log(`Códigos de itens extraídos: ${itemCodigos.length}`);
      
      // Busca todos os detalhes desses itens
      if (itemCodigos.length > 0) {
        // Divide em lotes menores para evitar problemas com o IN
        const batchSize = 1000;
        const batches = [];
        
        for (let i = 0; i < itemCodigos.length; i += batchSize) {
          batches.push(itemCodigos.slice(i, i + batchSize));
        }
        
        console.log(`Dividido em ${batches.length} lotes para busca de detalhes`);
        
        // Busca detalhes para cada lote
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];
          console.log(`Buscando detalhes para o lote ${i+1}/${batches.length} (${batch.length} itens)`);
          
          const batchItems = await fetchInBatches<any>(
            async (offset: number, limit: number) => {
              let query = supabase
                .from("BLUEBAY_ITEM")
                .select("*")
                .in("ITEM_CODIGO", batch)
                .order("DESCRICAO")
                .range(offset, offset + limit - 1);
              
              if (groupFilter && groupFilter !== "all") {
                query = query.eq("GRU_CODIGO", groupFilter);
              }
              
              return await query;
            },
            5000
          );
          
          console.log(`Encontrados ${batchItems.length} detalhes para o lote ${i+1}`);
          totalItems = [...totalItems, ...batchItems];
          console.log(`Total acumulado: ${totalItems.length} itens`);
        }
      }
      
      // Remover duplicatas pelo ITEM_CODIGO (caso ocorram na junção de lotes)
      const uniqueItemsMap = new Map();
      let duplicateCount = 0;
      
      totalItems.forEach(item => {
        if (item && item.ITEM_CODIGO && !uniqueItemsMap.has(item.ITEM_CODIGO)) {
          uniqueItemsMap.set(item.ITEM_CODIGO, item);
        } else if (item && item.ITEM_CODIGO) {
          duplicateCount++;
        }
      });
      
      if (duplicateCount > 0) {
        console.log(`Removidas ${duplicateCount} duplicatas na junção final`);
      }
      
      totalItems = Array.from(uniqueItemsMap.values());
    }
    
    console.log(`Total final: ${totalItems.length} itens carregados com sucesso`);
    return totalItems;
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
