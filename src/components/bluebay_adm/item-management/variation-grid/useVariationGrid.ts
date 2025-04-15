
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { verifyItemExists } from "@/services/bluebay_adm/itemManagementService";

export const useVariationGrid = (itemCode: string) => {
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [existingVariations, setExistingVariations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itemExists, setItemExists] = useState(false);
  const [isCheckingItem, setIsCheckingItem] = useState(true);
  const { toast } = useToast();

  const fetchColors = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("Cor")
        .select("*")
        .order("nome");

      if (error) throw error;
      setColors(data || []);
    } catch (error: any) {
      console.error("Error fetching colors:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar cores",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchSizes = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("Tamanho")
        .select("*")
        .order("ordem");

      if (error) throw error;
      setSizes(data || []);
    } catch (error: any) {
      console.error("Error fetching sizes:", error.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar tamanhos",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchExistingVariations = useCallback(async () => {
    if (!itemCode) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .select("*")
        .eq("item_codigo", itemCode);

      if (error) throw error;
      setExistingVariations(data || []);
      
      // Pre-select existing colors and sizes
      if (data && data.length > 0) {
        const colorIds = [...new Set(data.map(v => v.id_cor))];
        const sizeIds = [...new Set(data.map(v => v.id_tamanho))];
        
        setSelectedColors(colorIds);
        setSelectedSizes(sizeIds);
      }
    } catch (error: any) {
      console.error("Error fetching existing variations:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [itemCode]);

  // Check if the item exists
  const checkItemExists = useCallback(async () => {
    if (!itemCode) {
      setItemExists(false);
      setIsCheckingItem(false);
      return;
    }
    
    try {
      console.log(`Checking if item ${itemCode} exists in database...`);
      setIsCheckingItem(true);
      const exists = await verifyItemExists(itemCode);
      console.log(`Item ${itemCode} exists: ${exists}`);
      setItemExists(exists);
    } catch (error) {
      console.error("Error checking if item exists:", error);
      setItemExists(false);
    } finally {
      setIsCheckingItem(false);
    }
  }, [itemCode]);

  // Initialize data
  useEffect(() => {
    if (!itemCode) {
      setIsCheckingItem(false);
      setItemExists(false);
      return;
    }
    
    const initializeData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchColors(),
          fetchSizes(),
          checkItemExists()
        ]);
        
        // Only fetch variations if the item exists
        const exists = await verifyItemExists(itemCode);
        if (exists) {
          await fetchExistingVariations();
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [itemCode, fetchColors, fetchSizes, fetchExistingVariations, checkItemExists]);

  const handleToggleColor = (colorId: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorId)) {
        return prev.filter(id => id !== colorId);
      } else {
        return [...prev, colorId];
      }
    });
  };

  const handleToggleSize = (sizeId: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(sizeId)) {
        return prev.filter(id => id !== sizeId);
      } else {
        return [...prev, sizeId];
      }
    });
  };

  const handleSelectAllColors = () => {
    setSelectedColors(colors.map(color => color.id));
  };

  const handleClearAllColors = () => {
    setSelectedColors([]);
  };

  const handleSelectAllSizes = () => {
    setSelectedSizes(sizes.map(size => size.id));
  };

  const handleClearAllSizes = () => {
    setSelectedSizes([]);
  };

  const handleSaveGrid = async () => {
    if (!itemCode) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Código do item não encontrado",
      });
      return;
    }

    // Verify item existence
    const exists = await verifyItemExists(itemCode);
    if (!exists) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Este item não existe na base de dados. Salve o item primeiro.",
      });
      setItemExists(false);
      return;
    }

    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      toast({
        variant: "destructive",
        title: "Seleção incompleta",
        description: "Selecione pelo menos uma cor e um tamanho",
      });
      return;
    }

    setIsLoading(true);
    try {
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
              matriz: 1,
              filial: 1
            });
          }
          
          // Mark this combination as processed
          existingVariationsMap.delete(key);
        });
      });
      
      // Any remaining variations in the map should be removed
      existingVariationsMap.forEach(variation => {
        variationsToRemove.push(variation.id);
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
      for (const id of variationsToRemove) {
        const { error: removeError } = await supabase
          .from("BLUEBAY_ITEM_VARIACAO")
          .delete()
          .eq("id", id);
        
        if (removeError) throw removeError;
      }
      
      // Refresh variations
      await fetchExistingVariations();
      
      toast({
        title: "Grade atualizada",
        description: `Adicionadas: ${variationsToAdd.length}, Removidas: ${variationsToRemove.length}`,
      });
    } catch (error: any) {
      console.error("Error saving grid:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar grade",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    colors,
    sizes,
    selectedColors,
    selectedSizes,
    existingVariations,
    isLoading,
    isCheckingItem,
    itemExists,
    handleToggleColor,
    handleToggleSize,
    handleSelectAllColors,
    handleClearAllColors,
    handleSelectAllSizes,
    handleClearAllSizes,
    handleSaveGrid
  };
};
