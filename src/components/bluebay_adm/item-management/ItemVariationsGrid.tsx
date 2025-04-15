
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Save, Grid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ItemVariationsGridProps {
  itemCode: string;
}

export const ItemVariationsGrid = ({ itemCode }: ItemVariationsGridProps) => {
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [gridData, setGridData] = useState<{[key: string]: {[key: string]: boolean}}>({});
  const [existingVariations, setExistingVariations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Initialize the grid
  useEffect(() => {
    if (itemCode) {
      fetchColors();
      fetchSizes();
      fetchExistingVariations();
    }
  }, [itemCode, fetchColors, fetchSizes, fetchExistingVariations]);

  // Update grid data when colors, sizes, or existing variations change
  useEffect(() => {
    if (colors.length && sizes.length) {
      const initialGrid: {[key: string]: {[key: string]: boolean}} = {};
      
      colors.forEach(color => {
        initialGrid[color.id] = {};
        
        sizes.forEach(size => {
          // Check if this variation already exists
          const exists = existingVariations.some(
            v => v.id_cor === color.id && v.id_tamanho === size.id
          );
          
          initialGrid[color.id][size.id] = exists;
        });
      });
      
      setGridData(initialGrid);
    }
  }, [colors, sizes, existingVariations]);

  const handleToggleCell = (colorId: string, sizeId: string) => {
    setGridData(prev => ({
      ...prev,
      [colorId]: {
        ...prev[colorId],
        [sizeId]: !prev[colorId][sizeId]
      }
    }));
  };

  const handleSelectAllForColor = (colorId: string, value: boolean) => {
    setGridData(prev => {
      const updatedColor = { ...prev[colorId] };
      
      sizes.forEach(size => {
        updatedColor[size.id] = value;
      });
      
      return {
        ...prev,
        [colorId]: updatedColor
      };
    });
  };

  const handleSelectAllForSize = (sizeId: string, value: boolean) => {
    setGridData(prev => {
      const updatedGrid = { ...prev };
      
      colors.forEach(color => {
        updatedGrid[color.id] = {
          ...updatedGrid[color.id],
          [sizeId]: value
        };
      });
      
      return updatedGrid;
    });
  };

  const handleSelectAll = (value: boolean) => {
    setGridData(prev => {
      const updatedGrid = { ...prev };
      
      colors.forEach(color => {
        updatedGrid[color.id] = updatedGrid[color.id] || {};
        
        sizes.forEach(size => {
          updatedGrid[color.id][size.id] = value;
        });
      });
      
      return updatedGrid;
    });
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

    setIsLoading(true);
    try {
      // Prepare variations to add and remove
      const variationsToAdd: any[] = [];
      const variationsToRemove: any[] = [];
      
      // Check for each color and size
      colors.forEach(color => {
        sizes.forEach(size => {
          const shouldExist = gridData[color.id]?.[size.id] || false;
          const doesExist = existingVariations.some(
            v => v.id_cor === color.id && v.id_tamanho === size.id
          );
          
          if (shouldExist && !doesExist) {
            // Add new variation
            variationsToAdd.push({
              item_codigo: itemCode,
              id_cor: color.id,
              id_tamanho: size.id,
              quantidade: 0,
              ean: "",
              matriz: 1, // Default value
              filial: 1  // Default value
            });
          } else if (!shouldExist && doesExist) {
            // Remove existing variation
            const variation = existingVariations.find(
              v => v.id_cor === color.id && v.id_tamanho === size.id
            );
            if (variation) {
              variationsToRemove.push(variation.id);
            }
          }
        });
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
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSelectAll(true)}
          >
            Selecionar Todos
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSelectAll(false)}
          >
            Limpar Todos
          </Button>
          <Button 
            size="sm" 
            onClick={handleSaveGrid} 
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Grade
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center font-medium w-24">Cor / Tamanho</TableHead>
                {sortedSizes.map(size => (
                  <TableHead key={size.id} className="text-center">
                    <div className="flex flex-col items-center">
                      <span>{size.nome}</span>
                      <Checkbox 
                        className="mt-1"
                        checked={colors.every(color => gridData[color.id]?.[size.id])}
                        onCheckedChange={(checked) => handleSelectAllForSize(size.id, !!checked)}
                      />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {colors.map(color => (
                <TableRow key={color.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {color.codigo_hex && (
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.codigo_hex }}
                        />
                      )}
                      <span>{color.nome}</span>
                      <Checkbox 
                        checked={sortedSizes.every(size => gridData[color.id]?.[size.id])}
                        onCheckedChange={(checked) => handleSelectAllForColor(color.id, !!checked)}
                      />
                    </div>
                  </TableCell>
                  {sortedSizes.map(size => (
                    <TableCell key={size.id} className="text-center">
                      <Checkbox 
                        checked={gridData[color.id]?.[size.id] || false}
                        onCheckedChange={() => handleToggleCell(color.id, size.id)}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
