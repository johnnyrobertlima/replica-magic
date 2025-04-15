
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { verifyItemExists } from "@/services/bluebay_adm/itemManagementService";
import { ColorSelectionPanel } from "./variation-grid/ColorSelectionPanel";
import { SizeSelectionPanel } from "./variation-grid/SizeSelectionPanel";
import { VariationSummary } from "./variation-grid/VariationSummary";
import { EmptyStateDisplay } from "./variation-grid/EmptyStateDisplay";

interface ItemVariationsGridProps {
  itemCode: string;
}

export const ItemVariationsGrid = ({ itemCode }: ItemVariationsGridProps) => {
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [existingVariations, setExistingVariations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itemExists, setItemExists] = useState(true);
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
    if (!itemCode) return;
    
    try {
      setIsLoading(true);
      const exists = await verifyItemExists(itemCode);
      setItemExists(exists);
    } catch (error) {
      console.error("Error checking if item exists:", error);
      setItemExists(false);
    } finally {
      setIsLoading(false);
    }
  }, [itemCode]);

  // Initialize data
  useEffect(() => {
    if (itemCode) {
      const initializeData = async () => {
        setIsLoading(true);
        try {
          await checkItemExists();
          await Promise.all([
            fetchColors(),
            fetchSizes(),
            fetchExistingVariations()
          ]);
        } finally {
          setIsLoading(false);
        }
      };
      
      initializeData();
    }
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

    if (!itemExists) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Este item não existe na base de dados. Salve o item primeiro.",
      });
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
              matriz: 1, // Default value
              filial: 1  // Default value
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
        const { error: addError } = await supabase
          .from("BLUEBAY_ITEM_VARIACAO")
          .insert(variationsToAdd);
        
        if (addError) throw addError;
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
      fetchExistingVariations();
      
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

  // Determine what to render based on current state
  if (!itemCode) {
    return <EmptyStateDisplay type="no-item" />;
  }

  if (!itemExists) {
    return <EmptyStateDisplay type="item-not-saved" />;
  }

  if (isLoading && (!colors.length || !sizes.length)) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!colors.length || !sizes.length) {
    return <EmptyStateDisplay type="no-data" />;
  }

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Grade de Variações</CardTitle>
        <Button 
          size="sm" 
          onClick={handleSaveGrid} 
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar Grade
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Colors selection */}
          <ColorSelectionPanel 
            colors={colors}
            selectedColors={selectedColors}
            onToggleColor={handleToggleColor}
            onSelectAll={handleSelectAllColors}
            onClearAll={handleClearAllColors}
          />

          {/* Sizes selection */}
          <SizeSelectionPanel 
            sizes={sizes}
            selectedSizes={selectedSizes}
            onToggleSize={handleToggleSize}
            onSelectAll={handleSelectAllSizes}
            onClearAll={handleClearAllSizes}
          />
        </div>
        
        <VariationSummary 
          selectedColorsCount={selectedColors.length}
          selectedSizesCount={selectedSizes.length}
          combinationsCount={selectedColors.length * selectedSizes.length}
          existingVariationsCount={existingVariations.length}
          onSave={handleSaveGrid}
          isLoading={isLoading}
          isValid={selectedColors.length > 0 && selectedSizes.length > 0}
        />
      </CardContent>
    </Card>
  );
};
