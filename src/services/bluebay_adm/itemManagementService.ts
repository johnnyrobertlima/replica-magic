import { supabase } from "@/integrations/supabase/client";

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
    .select("*", { count: "exact" })
    .order("DESCRICAO")
    .range(from, to);

  // Apply filters
  if (searchTerm) {
    query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
  }

  if (groupFilter && groupFilter !== "all") {
    query = query.eq("GRU_CODIGO", groupFilter);
  }

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
    if (isUpdate) {
      const { error } = await supabase
        .from("BLUEBAY_ITEM")
        .update({
          DESCRICAO: itemData.DESCRICAO,
          GRU_CODIGO: itemData.GRU_CODIGO,
          GRU_DESCRICAO: itemData.GRU_DESCRICAO,
          CODIGOAUX: itemData.CODIGOAUX,
          id_subcategoria: itemData.id_subcategoria,
          id_marca: itemData.id_marca,
          empresa: itemData.empresa,
          estacao: itemData.estacao,
          genero: itemData.genero,
          faixa_etaria: itemData.faixa_etaria,
          ativo: itemData.ativo,
          ncm: itemData.ncm
        })
        .eq("ITEM_CODIGO", itemData.ITEM_CODIGO);

      if (error) throw error;
      
      return { success: true, message: "O item foi atualizado com sucesso." };
    } else {
      // For new items, include current date and default values for MATRIZ and FILIAL
      const { error } = await supabase
        .from("BLUEBAY_ITEM")
        .insert({
          ITEM_CODIGO: itemData.ITEM_CODIGO,
          DESCRICAO: itemData.DESCRICAO,
          GRU_CODIGO: itemData.GRU_CODIGO,
          GRU_DESCRICAO: itemData.GRU_DESCRICAO,
          CODIGOAUX: itemData.CODIGOAUX,
          id_subcategoria: itemData.id_subcategoria,
          id_marca: itemData.id_marca,
          empresa: itemData.empresa,
          estacao: itemData.estacao,
          genero: itemData.genero,
          faixa_etaria: itemData.faixa_etaria,
          ativo: itemData.ativo,
          ncm: itemData.ncm,
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

// Updated function to verify if an item exists before creating variations
export const verifyItemExists = async (itemCode: string): Promise<boolean> => {
  try {
    if (!itemCode) return false;
    
    const { data, error, count } = await supabase
      .from("BLUEBAY_ITEM")
      .select("ITEM_CODIGO", { count: "exact" })
      .eq("ITEM_CODIGO", itemCode);

    if (error) {
      console.error("Error verifying item existence:", error);
      return false;
    }

    return Array.isArray(data) && data.length > 0;
  } catch (error) {
    console.error("Error checking item existence:", error);
    return false;
  }
};
