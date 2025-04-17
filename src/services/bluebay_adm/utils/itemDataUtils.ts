
import { supabase } from "@/integrations/supabase/client";

/**
 * Get Bluebay group codes from the database
 */
export const getBluebayGroupCodes = async (): Promise<string[]> => {
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
 * Fetch filtered items for export
 */
export const fetchFilteredItems = async (
  searchTerm: string,
  groupFilter: string,
  empresaFilter: string,
  bluebayGroupCodes: string[]
): Promise<any[]> => {
  try {
    // Build our query
    let query = supabase
      .from("BLUEBAY_ITEM")
      .select("*")
      .eq("ativo", true) // Only fetch active items
      .in("GRU_CODIGO", bluebayGroupCodes);
    
    // Apply filters
    if (searchTerm) {
      query = query.or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%,CODIGOAUX.ilike.%${searchTerm}%`);
    }

    if (groupFilter && groupFilter !== "all") {
      query = query.eq("GRU_CODIGO", groupFilter);
    }

    if (empresaFilter && empresaFilter !== "all") {
      query = query.eq("empresa", empresaFilter);
    }

    // Get all matching items
    const { data, error } = await query.order("DESCRICAO");

    if (error) {
      console.error("Error fetching items for export:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching filtered items for export:", error);
    throw error;
  }
};
