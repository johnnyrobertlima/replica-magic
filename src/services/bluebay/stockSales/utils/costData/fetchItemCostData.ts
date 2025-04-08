
import { supabase } from "@/integrations/supabase/client";
import type { CostDataRecord } from './costDataTypes';

/**
 * Fetches cost data for specific items
 * @param itemCodes Array of item codes to fetch cost data for
 */
export const fetchItemCostData = async (itemCodes: string[]): Promise<CostDataRecord[]> => {
  if (!itemCodes || itemCodes.length === 0) {
    return [];
  }
  
  try {
    console.log("Fetching cost data for items:", itemCodes.length);
    
    // Batch the requests to avoid query string limitations
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < itemCodes.length; i += batchSize) {
      const batchCodes = itemCodes.slice(i, i + batchSize);
      batches.push(batchCodes);
    }
    
    const results: CostDataRecord[] = [];
    
    for (const batch of batches) {
      // Use a type assertion to avoid TypeScript deep instantiation issues
      const { data, error } = await supabase
        .from('vw_custos_items' as any)
        .select('*')
        .in('ITEM_CODIGO', batch);
      
      if (error) {
        console.error("Error fetching cost data batch:", error);
        continue;
      }
      
      if (data) {
        // Use type assertion to avoid deep instantiation issues
        results.push(...(data as unknown as CostDataRecord[]));
      }
    }
    
    return results;
  } catch (error) {
    console.error("Error in fetchItemCostData:", error);
    return [];
  }
};
