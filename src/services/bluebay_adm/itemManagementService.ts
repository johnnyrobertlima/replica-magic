
import { supabase } from "@/integrations/supabase/client";

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
  console.log(`Loaded ${uniqueItems.length} items`);
  
  return { 
    items: uniqueItems, 
    count: count || 0 
  };
};

export const fetchGroups = async () => {
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

  return uniqueGroups || [];
};

export const saveItem = async (itemData: any, isUpdate: boolean) => {
  if (isUpdate) {
    const { error } = await supabase
      .from("BLUEBAY_ITEM")
      .update({
        DESCRICAO: itemData.DESCRICAO,
        GRU_CODIGO: itemData.GRU_CODIGO,
        GRU_DESCRICAO: itemData.GRU_DESCRICAO,
        CODIGOAUX: itemData.CODIGOAUX,
      })
      .eq("ITEM_CODIGO", itemData.ITEM_CODIGO);

    if (error) throw error;
    
    return { success: true, message: "O item foi atualizado com sucesso." };
  } else {
    // For new items, include current date
    const { error } = await supabase
      .from("BLUEBAY_ITEM")
      .insert({
        ITEM_CODIGO: itemData.ITEM_CODIGO,
        DESCRICAO: itemData.DESCRICAO,
        GRU_CODIGO: itemData.GRU_CODIGO,
        GRU_DESCRICAO: itemData.GRU_DESCRICAO,
        CODIGOAUX: itemData.CODIGOAUX,
        DATACADASTRO: new Date().toISOString(),
        MATRIZ: 1, // Default values
        FILIAL: 1, // Default values
      });

    if (error) throw error;
    
    return { success: true, message: "O item foi cadastrado com sucesso." };
  }
};

export const deleteItem = async (itemCode: string) => {
  const { error } = await supabase
    .from("BLUEBAY_ITEM")
    .delete()
    .eq("ITEM_CODIGO", itemCode);

  if (error) throw error;
  
  return { success: true, message: "O item foi excluído com sucesso." };
};
