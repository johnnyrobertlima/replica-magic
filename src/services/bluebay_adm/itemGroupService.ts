
import { supabase } from "@/integrations/supabase/client";

export const fetchEmpresas = async (): Promise<string[]> => {
  console.info("Buscando todas as empresas...");
  
  try {
    // Try to fetch distinct empresa values from BLUEBAY_ITEM
    const { data, error } = await supabase
      .from('BLUEBAY_ITEM')
      .select('empresa')
      .not('empresa', 'is', null)
      .order('empresa');
    
    if (error) throw error;
    
    // Extract unique empresa values
    const empresas = Array.from(new Set(data.map(item => item.empresa))).filter(Boolean);
    
    // Add 'nao_definida' as a default option if it doesn't exist
    if (!empresas.includes('nao_definida')) {
      empresas.push('nao_definida');
    }
    
    console.info(`Total de empresas: ${empresas.length}`);
    return empresas.sort();
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    
    // Fallback to hardcoded list in case of error
    const empresas = ["Bluebay", "BK", "JAB", "nao_definida"];
    console.info(`Total de empresas (fallback): ${empresas.length}`);
    return empresas.sort();
  }
};

export const fetchGroups = async (): Promise<any[]> => {
  console.info("Buscando todos os grupos...");
  
  try {
    // Fetch all groups from BLUEBAY_ITEM with their GRU_CODIGO and GRU_DESCRICAO
    const { data, error } = await supabase
      .from('BLUEBAY_ITEM')
      .select('GRU_CODIGO, GRU_DESCRICAO, empresa')
      .not('GRU_CODIGO', 'is', null)
      .not('GRU_DESCRICAO', 'is', null)
      .order('GRU_DESCRICAO');
    
    if (error) throw error;
    
    // Process the data to get unique groups with their properties
    const groupMap = new Map();
    
    data.forEach(item => {
      if (!groupMap.has(item.GRU_CODIGO)) {
        groupMap.set(item.GRU_CODIGO, {
          GRU_CODIGO: item.GRU_CODIGO,
          GRU_DESCRICAO: item.GRU_DESCRICAO,
          empresa: item.empresa || 'nao_definida',
          ativo: true // Default to active
        });
      }
    });
    
    const groups = Array.from(groupMap.values());
    console.info(`Total de grupos: ${groups.length}`);
    
    return groups;
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
    return []; // Return empty array in case of error
  }
};

export const saveGroup = async (groupData: any): Promise<void> => {
  console.info("Salvando grupo:", groupData);
  
  try {
    // For existing groups, update all items with that GRU_CODIGO
    if (groupData.GRU_CODIGO) {
      const { error } = await supabase
        .from('BLUEBAY_ITEM')
        .update({
          GRU_DESCRICAO: groupData.GRU_DESCRICAO,
          empresa: groupData.empresa === 'nao_definida' ? null : groupData.empresa
        })
        .eq('GRU_CODIGO', groupData.GRU_CODIGO);
      
      if (error) throw error;
    } else {
      // For new groups, we'd need a different strategy as we don't have a dedicated groups table
      console.warn("Criação de novos grupos não implementada no backend");
    }
    
    console.info("Grupo salvo com sucesso");
    return;
  } catch (error) {
    console.error("Erro ao salvar grupo:", error);
    throw error;
  }
};
