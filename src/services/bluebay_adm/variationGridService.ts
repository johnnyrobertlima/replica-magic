
import { supabase } from "@/integrations/supabase/client";
import { getItemWithMatrizFilial } from "./itemManagementService";

/**
 * Save grid variations to the database
 */
export const saveVariationGrid = async (
  itemCode: string,
  selectedColors: string[],
  selectedSizes: string[],
  existingVariations: any[]
) => {
  if (selectedColors.length === 0 || selectedSizes.length === 0) {
    throw new Error("Selecione pelo menos uma cor e um tamanho");
  }

  // Get the complete item data with MATRIZ and FILIAL
  const itemData = await getItemWithMatrizFilial(itemCode);
  if (!itemData) {
    throw new Error("Este item não existe na base de dados. Salve o item primeiro.");
  }

  const { MATRIZ, FILIAL } = itemData;
  
  // Prepare variations to add and remove
  const variationsToAdd: any[] = [];
  const variationsToRemove: any[] = [];
  
  // Create a map of existing variations for quick lookup
  const existingVariationsMap = new Map();
  existingVariations.forEach(v => {
    const key = `${v.id_cor}-${v.id_tamanho}`;
    existingVariationsMap.set(key, v);
  });
  
  // Check each combination of selected colors and sizes
  selectedColors.forEach(colorId => {
    selectedSizes.forEach(sizeId => {
      const key = `${colorId}-${sizeId}`;
      const existingVariation = existingVariationsMap.get(key);
      
      if (!existingVariation) {
        // Add new variation
        variationsToAdd.push({
          item_codigo: itemCode,
          id_cor: colorId,
          id_tamanho: sizeId,
          quantidade: 0,
          ean: "",
          matriz: MATRIZ,
          filial: FILIAL
        });
      }
      
      // Mark this combination as processed
      existingVariationsMap.delete(key);
    });
  });
  
  // Any remaining variations in the map should be removed
  const idsToRemove: any[] = [];
  existingVariationsMap.forEach(variation => {
    idsToRemove.push(variation.id);
  });
  
  // Process additions
  if (variationsToAdd.length > 0) {
    console.log("Adding variations:", variationsToAdd);
    const { error: addError } = await supabase
      .from("BLUEBAY_ITEM_VARIACAO")
      .insert(variationsToAdd);
    
    if (addError) {
      console.error("Error adding variations:", addError);
      throw addError;
    }
  }
  
  // Process removals
  for (const id of idsToRemove) {
    const { error: removeError } = await supabase
      .from("BLUEBAY_ITEM_VARIACAO")
      .delete()
      .eq("id", id);
    
    if (removeError) throw removeError;
  }
  
  return {
    added: variationsToAdd.length,
    removed: idsToRemove.length
  };
};
