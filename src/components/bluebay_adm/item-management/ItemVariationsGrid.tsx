
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Save, Grid, Check, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { verifyItemExists } from "@/services/bluebay_adm/itemManagementService";

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
      const exists = await verifyItemExists(itemCode);
      setItemExists(exists);
    } catch (error) {
      console.error("Error checking if item exists:", error);
      setItemExists(false);
    }
  }, [itemCode]);

  // Initialize data
  useEffect(() => {
    if (itemCode) {
      fetchColors();
      fetchSizes();
      fetchExistingVariations();
      checkItemExists();
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

  // Sort sizes by order
  const sortedSizes = [...sizes].sort((a, b) => {
    return (a.ordem || 0) - (b.ordem || 0);
  });

  if (!itemCode) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Grade de Variações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-muted-foreground">
            <p>Salve o produto primeiro para poder criar variações</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!itemExists) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Grade de Variações</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>Atenção</AlertTitle>
            <AlertDescription>
              Este item ainda não foi salvo na base de dados. Salve o item primeiro para poder criar variações.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!colors.length || !sizes.length) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Grade de Variações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 text-muted-foreground">
            <Grid className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
            <p>Não há cores ou tamanhos cadastrados</p>
            <p className="text-xs mt-1">Cadastre pelo menos uma cor e um tamanho para montar a grade</p>
          </div>
        </CardContent>
      </Card>
    );
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
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Cores</Label>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAllColors}
                >
                  Selecionar Todos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAllColors}
                >
                  Limpar Todos
                </Button>
              </div>
            </div>
            <div className="border rounded-md p-4 grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
              {colors.map(color => (
                <div 
                  key={color.id} 
                  className="flex items-center space-x-2 hover:bg-muted p-2 rounded"
                >
                  <Checkbox 
                    id={`color-${color.id}`}
                    checked={selectedColors.includes(color.id)}
                    onCheckedChange={() => handleToggleColor(color.id)}
                  />
                  <div className="flex items-center gap-2">
                    {color.codigo_hex && (
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.codigo_hex }}
                      />
                    )}
                    <Label 
                      htmlFor={`color-${color.id}`} 
                      className="cursor-pointer font-normal flex-1"
                    >
                      {color.nome}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sizes selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Tamanhos</Label>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSelectAllSizes}
                >
                  Selecionar Todos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClearAllSizes}
                >
                  Limpar Todos
                </Button>
              </div>
            </div>
            <div className="border rounded-md p-4 grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
              {sortedSizes.map(size => (
                <div 
                  key={size.id} 
                  className="flex items-center space-x-2 hover:bg-muted p-2 rounded"
                >
                  <Checkbox 
                    id={`size-${size.id}`}
                    checked={selectedSizes.includes(size.id)}
                    onCheckedChange={() => handleToggleSize(size.id)}
                  />
                  <Label 
                    htmlFor={`size-${size.id}`} 
                    className="cursor-pointer font-normal"
                  >
                    {size.nome}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Combinações a serem geradas: {selectedColors.length * selectedSizes.length}</p>
              <p className="text-xs text-muted-foreground">Variações existentes: {existingVariations.length}</p>
            </div>
            <Button 
              size="sm" 
              onClick={handleSaveGrid} 
              disabled={isLoading || (selectedColors.length === 0 || selectedSizes.length === 0)}
            >
              <Save className="h-4 w-4 mr-2" />
              Gerar Grade
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
