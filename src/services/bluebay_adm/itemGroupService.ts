import { supabase } from "@/integrations/supabase/client";

// Fetch all groups with their active status and company
export const fetchGroups = async (): Promise<any[]> => {
  console.info("Buscando todos os grupos...");
  
  try {
    const { data, error, count } = await supabase
      .from("BLUEBAY_ITEM")
      .select("GRU_CODIGO, GRU_DESCRICAO, empresa, ativo", { count: "exact", head: false });
    
    if (error) {
      throw new Error(error.message || "Erro ao buscar grupos");
    }
    
    console.info(`Total de grupos com dados (potencialmente duplicados): ${data?.length}, count: ${count}`);
    
    // Use Map to efficiently handle duplicates and keep track of active status
    const groupsMap = new Map();
    
    data?.forEach(item => {
      if (!item.GRU_CODIGO || !item.GRU_DESCRICAO) return;
      
      // If this group code is already in the map, don't override existing data
      if (!groupsMap.has(item.GRU_CODIGO)) {
        groupsMap.set(item.GRU_CODIGO, {
          GRU_CODIGO: item.GRU_CODIGO,
          GRU_DESCRICAO: item.GRU_DESCRICAO,
          empresa: item.empresa || "",
          ativo: item.ativo !== undefined ? item.ativo : true
        });
      }
    });
    
    // Convert the map values back to an array
    const uniqueGroups = Array.from(groupsMap.values());
    
    console.info(`Total de grupos únicos após processamento: ${uniqueGroups.length}`);
    
    // Sort the groups alphabetically by description
    return uniqueGroups.sort((a, b) => 
      a.GRU_DESCRICAO.localeCompare(b.GRU_DESCRICAO)
    );
  } catch (error) {
    console.error("Error fetching groups:", error);
    // Ensure we're throwing an Error object with a message property
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Falha ao buscar grupos: ${String(error)}`);
    }
  }
};

// Fetch all unique empresa values
export const fetchEmpresas = async (): Promise<string[]> => {
  console.info("Buscando todas as empresas...");
  
  try {
    const { data, error } = await supabase
      .from("BLUEBAY_ITEM")
      .select("empresa", { count: "exact", head: false })
      .not("empresa", "is", null);
    
    if (error) {
      throw new Error(error.message || "Erro ao buscar empresas");
    }
    
    console.info(`Total de registros com dados de empresa: ${data?.length}`);
    
    // Extract unique empresa values
    const empresasSet = new Set<string>();
    
    data?.forEach(item => {
      if (item.empresa) {
        empresasSet.add(item.empresa);
      }
    });
    
    // Convert to array and sort alphabetically
    const uniqueEmpresas = Array.from(empresasSet).sort();
    
    console.info(`Total de empresas únicas após processamento: ${uniqueEmpresas.length}`);
    
    return uniqueEmpresas;
  } catch (error) {
    console.error("Error fetching empresas:", error);
    // Ensure we're throwing an Error object with a message property
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Falha ao buscar empresas: ${String(error)}`);
    }
  }
};

// Save or update a group
export const saveGroup = async (groupData: any): Promise<void> => {
  try {
    // Check if the group code already exists
    const { data: existingGroup, error: checkError } = await supabase
      .from("BLUEBAY_ITEM")
      .select("GRU_CODIGO")
      .eq("GRU_CODIGO", groupData.GRU_CODIGO)
      .limit(1);
    
    if (checkError) {
      throw new Error(checkError.message || "Erro ao verificar grupo existente");
    }
    
    if (existingGroup && existingGroup.length > 0) {
      // Update all items with this group code
      const { error: updateError } = await supabase
        .from("BLUEBAY_ITEM")
        .update({
          GRU_DESCRICAO: groupData.GRU_DESCRICAO,
          empresa: groupData.empresa,
          ativo: groupData.ativo
        })
        .eq("GRU_CODIGO", groupData.GRU_CODIGO);
      
      if (updateError) {
        throw new Error(updateError.message || "Erro ao atualizar grupo");
      }
    } else {
      // Create a new placeholder item with this group
      const { error: insertError } = await supabase
        .from("BLUEBAY_ITEM")
        .insert({
          GRU_CODIGO: groupData.GRU_CODIGO,
          GRU_DESCRICAO: groupData.GRU_DESCRICAO,
          empresa: groupData.empresa,
          ativo: groupData.ativo,
          ITEM_CODIGO: `GROUP_${groupData.GRU_CODIGO}`,
          FILIAL: 1,
          MATRIZ: 1
        });
      
      if (insertError) {
        throw new Error(insertError.message || "Erro ao inserir grupo");
      }
    }
  } catch (error) {
    console.error("Error saving group:", error);
    // Ensure we're throwing an Error object with a message property
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error(`Falha ao salvar grupo: ${String(error)}`);
    }
  }
};
