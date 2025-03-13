
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches representative names for the given representative codes
 * @param representanteCodes Array of representative codes
 * @returns Map of representative code to representative name
 */
export const fetchRepresentanteNames = async (representanteCodes: number[]): Promise<Map<number, string>> => {
  try {
    if (!representanteCodes.length) return new Map();
    
    // Filter out any null or undefined codes
    const validCodes = representanteCodes.filter(Boolean);
    if (!validCodes.length) return new Map();
    
    console.log("Fetching representative names for codes:", validCodes);
    
    const { data, error } = await supabase
      .from('vw_representantes')
      .select('codigo_representante, nome_representante')
      .in('codigo_representante', validCodes);
    
    if (error) {
      console.error("Error fetching representative names:", error);
      return new Map();
    }
    
    console.log("Fetched representative data:", data);
    
    const representanteMap = new Map<number, string>();
    data.forEach((rep: { codigo_representante: number, nome_representante: string }) => {
      representanteMap.set(rep.codigo_representante, rep.nome_representante);
    });
    
    return representanteMap;
  } catch (error) {
    console.error("Error in fetchRepresentanteNames:", error);
    return new Map();
  }
};

/**
 * Enhances client order groups with representative names
 * @param groups Client order groups
 * @returns Enhanced client order groups with representative names
 */
export const enhanceGroupsWithRepresentanteNames = async (groups: Record<string, any>) => {
  try {
    // Extract unique representative codes from all orders within groups
    const representanteCodes: number[] = [];
    
    Object.values(groups).forEach(group => {
      // Check for representante in group pedidos
      group.pedidos.forEach((pedido: any) => {
        if (pedido.REPRESENTANTE && !representanteCodes.includes(pedido.REPRESENTANTE)) {
          representanteCodes.push(pedido.REPRESENTANTE);
        }
      });
    });
    
    // Fetch all representative names at once
    const representanteMap = await fetchRepresentanteNames(representanteCodes);
    
    // Enhance each group with the representative name
    const enhancedGroups = { ...groups };
    
    Object.entries(enhancedGroups).forEach(([key, group]) => {
      // For each group, find the first pedido with a representante
      const firstPedidoWithRep = group.pedidos.find((p: any) => p.REPRESENTANTE && representanteMap.has(p.REPRESENTANTE));
      
      if (firstPedidoWithRep) {
        group.representanteNome = representanteMap.get(firstPedidoWithRep.REPRESENTANTE);
      }
    });
    
    return enhancedGroups;
  } catch (error) {
    console.error("Error enhancing groups with representative names:", error);
    return groups;
  }
};
