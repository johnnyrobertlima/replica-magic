
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VariationEditGridProps {
  itemCode: string;
  variations: any[];
  onBack: () => void;
  onSaved: () => void;
}

export const VariationEditGrid = ({ itemCode, variations, onBack, onSaved }: VariationEditGridProps) => {
  const [editableVariations, setEditableVariations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [colors, setColors] = useState<{[key: string]: any}>({});
  const [sizes, setSizes] = useState<{[key: string]: any}>({});
  const { toast } = useToast();

  useEffect(() => {
    // Initialize editable variations
    setEditableVariations(variations.map(v => ({ ...v })));
    
    // Fetch color and size data to display names
    fetchColorAndSizeData();
  }, [variations]);

  const fetchColorAndSizeData = async () => {
    try {
      // Fetch colors
      const { data: colorsData } = await supabase
        .from("Cor")
        .select("id, nome, codigo_hex");
      
      if (colorsData) {
        const colorsMap: {[key: string]: any} = {};
        colorsData.forEach(color => {
          colorsMap[color.id] = color;
        });
        setColors(colorsMap);
      }

      // Fetch sizes
      const { data: sizesData } = await supabase
        .from("Tamanho")
        .select("id, nome, ordem");
      
      if (sizesData) {
        const sizesMap: {[key: string]: any} = {};
        sizesData.forEach(size => {
          sizesMap[size.id] = size;
        });
        setSizes(sizesMap);
      }
    } catch (error) {
      console.error("Error fetching color and size data:", error);
    }
  };

  const handleChange = (index: number, field: string, value: string | number) => {
    const updatedVariations = [...editableVariations];
    updatedVariations[index] = {
      ...updatedVariations[index],
      [field]: value
    };
    setEditableVariations(updatedVariations);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update all variations
      for (const variation of editableVariations) {
        const { error } = await supabase
          .from("BLUEBAY_ITEM_VARIACAO")
          .update({
            quantidade: variation.quantidade,
            ean: variation.ean
          })
          .eq("id", variation.id);
        
        if (error) throw error;
      }
      
      toast({
        title: "Variações atualizadas",
        description: "As quantidades e EANs foram salvos com sucesso",
      });
      
      onSaved();
    } catch (error: any) {
      console.error("Error updating variations:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar variações",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Editar Variações - {itemCode}</CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cor</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>EAN</TableHead>
                <TableHead>Quantidade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editableVariations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    Nenhuma variação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                editableVariations.map((variation, index) => (
                  <TableRow key={variation.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {colors[variation.id_cor]?.codigo_hex && (
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: colors[variation.id_cor]?.codigo_hex }}
                          />
                        )}
                        <span>{colors[variation.id_cor]?.nome || "Cor não encontrada"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sizes[variation.id_tamanho]?.nome || "Tamanho não encontrado"}
                    </TableCell>
                    <TableCell>
                      <Input
                        value={variation.ean || ""}
                        onChange={(e) => handleChange(index, "ean", e.target.value)}
                        placeholder="Digite o EAN"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={variation.quantidade}
                        onChange={(e) => handleChange(index, "quantidade", parseInt(e.target.value) || 0)}
                        min={0}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
