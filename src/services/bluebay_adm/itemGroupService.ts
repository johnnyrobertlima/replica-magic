
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
    console.info(`Total de registros com dados de empresa: ${data.length}`);
    console.info(`Total de empresas únicas após processamento: ${empresas.length}`);
    
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
    // Fetch all group descriptions, as requested in the instructions
    const { data, error } = await supabase
      .from('BLUEBAY_ITEM')
      .select('GRU_CODIGO, GRU_DESCRICAO')
      .not('GRU_DESCRICAO', 'is', null);
    
    if (error) throw error;
    
    console.info(`Total de registros com grupo: ${data.length}`);
    
    // Create a map to store unique groups with their code and description
    const groupMap = new Map();
    
    // Process the data to get unique groups by description
    data.forEach(item => {
      if (item.GRU_DESCRICAO && !groupMap.has(item.GRU_DESCRICAO)) {
        groupMap.set(item.GRU_DESCRICAO, {
          GRU_CODIGO: item.GRU_CODIGO || '',
          GRU_DESCRICAO: item.GRU_DESCRICAO,
          empresa: 'nao_definida', // Default value since we're not filtering by empresa
          ativo: true // Default to active for all groups
        });
      }
    });
    
    const groups = Array.from(groupMap.values());
    console.info(`Total de grupos únicos após processamento: ${groups.length}`);
    
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
