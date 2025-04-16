
import { supabase } from "@/integrations/supabase/client";

/**
 * Get Bluebay group codes from the database
 * @returns Array of Bluebay group codes
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

    // Make sure we filter out null or undefined values and log the counts
    const filteredCodes = data.map(group => group.gru_codigo).filter(Boolean);
    console.log(`Fetched ${data.length} Bluebay group codes, ${filteredCodes.length} valid codes after filtering`);
    return filteredCodes;
  } catch (error) {
    console.error("Error in getBluebayGroupCodes:", error);
    return [];
  }
};

/**
 * Fetch filtered items for export/import operations
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
      .eq("ativo", true); // Only fetch active items
    
    // Apply Bluebay group filter if we have group codes
    if (bluebayGroupCodes.length > 0) {
      query = query.in("GRU_CODIGO", bluebayGroupCodes);
    } else {
      console.warn("No Bluebay group codes available for filtering, query may return unexpected results");
    }
    
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
      console.error("Error fetching items:", error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} items from BLUEBAY_ITEM table`);
    return data || [];
  } catch (error) {
    console.error("Error fetching filtered items:", error);
    throw error;
  }
};
