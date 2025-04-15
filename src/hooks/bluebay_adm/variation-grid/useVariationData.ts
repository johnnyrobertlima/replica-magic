
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getItemWithMatrizFilial } from "@/services/bluebay_adm/itemManagementService";

/**
 * Hook for fetching variation-related data (colors, sizes, existing variations)
 */
export const useVariationData = (itemCode: string) => {
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
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
    } catch (error: any) {
      console.error("Error fetching existing variations:", error.message);
    } finally {
      setIsLoading(false);
    }
  }, [itemCode]);

  // Check if the item exists with complete data
  const checkItemExists = useCallback(async () => {
    if (!itemCode) {
      setItemExists(false);
      setIsCheckingItem(false);
      return;
    }
    
    try {
      console.log(`Checking if item ${itemCode} exists in database...`);
      setIsCheckingItem(true);
      const itemData = await getItemWithMatrizFilial(itemCode);
      const exists = !!itemData;
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
        const itemData = await getItemWithMatrizFilial(itemCode);
        if (itemData) {
          await fetchExistingVariations();
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [itemCode, fetchColors, fetchSizes, fetchExistingVariations, checkItemExists]);

  return {
    colors,
    sizes,
    existingVariations,
    isLoading,
    isCheckingItem,
    itemExists,
    refreshExistingVariations: fetchExistingVariations
  };
};
