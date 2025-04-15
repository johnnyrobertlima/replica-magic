
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";

interface Color {
  id: string;
  nome: string;
  codigo_hex?: string;
}

interface Size {
  id: string;
  nome: string;
  ordem: number;
}

interface Variation {
  id: string;
  item_codigo: string;
  id_cor: string;
  id_tamanho: string;
  ean: string;
  quantidade: number;
  cor?: Color;
  tamanho?: Size;
  item?: any;
}

export const ProductVariationsManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const { toast } = useToast();

  // Fetch items that match the search term
  useEffect(() => {
    const fetchItems = async () => {
      if (!searchTerm || searchTerm.length < 3) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("BLUEBAY_ITEM")
          .select("*")
          .or(`ITEM_CODIGO.ilike.%${searchTerm}%,DESCRICAO.ilike.%${searchTerm}%`)
          .order("DESCRICAO")
          .limit(10);

        if (error) throw error;
        setItems(data || []);
      } catch (error: any) {
        console.error("Error fetching items:", error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar produtos",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, toast]);

  // Fetch colors and sizes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch colors
        const { data: colorsData, error: colorsError } = await supabase
          .from("Cor")
          .select("*")
          .order("nome");

        if (colorsError) throw colorsError;
        setColors(colorsData || []);

        // Fetch sizes
        const { data: sizesData, error: sizesError } = await supabase
          .from("Tamanho")
          .select("*")
          .order("ordem");

        if (sizesError) throw sizesError;
        setSizes(sizesData || []);
      } catch (error: any) {
        console.error("Error fetching variation data:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar dados",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Fetch variations for selected item
  useEffect(() => {
    const fetchVariations = async () => {
      if (!selectedItem) {
        setVariations([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("BLUEBAY_ITEM_VARIACAO")
          .select(`
            *,
            cor:id_cor(id, nome, codigo_hex),
            tamanho:id_tamanho(id, nome, ordem)
          `)
          .eq("item_codigo", selectedItem);

        if (error) throw error;
        setVariations(data || []);
      } catch (error: any) {
        console.error("Error fetching variations:", error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar variações",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVariations();
  }, [selectedItem, toast]);

  const handleItemSelect = (item: any) => {
    setSelectedItem(item.ITEM_CODIGO);
  };

  const handleAddVariation = async () => {
    if (!selectedItem || !selectedColor || !selectedSize) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Selecione um produto, cor e tamanho.",
      });
      return;
    }

    // Check if variation already exists
    const exists = variations.some(
      v => v.id_cor === selectedColor && v.id_tamanho === selectedSize
    );

    if (exists) {
      toast({
        variant: "destructive",
        title: "Variação já existe",
        description: "Esta combinação de cor e tamanho já existe para este produto.",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the selected item to get matriz and filial
      const { data: itemData, error: itemError } = await supabase
        .from("BLUEBAY_ITEM")
        .select("MATRIZ, FILIAL")
        .eq("ITEM_CODIGO", selectedItem)
        .single();
      
      if (itemError) throw itemError;

      const { data, error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .insert([{
          item_codigo: selectedItem,
          matriz: itemData.MATRIZ,
          filial: itemData.FILIAL,
          id_cor: selectedColor,
          id_tamanho: selectedSize,
          ean: "",
          quantidade: 0
        }])
        .select(`
          *,
          cor:id_cor(id, nome, codigo_hex),
          tamanho:id_tamanho(id, nome, ordem)
        `);

      if (error) throw error;
      
      toast({
        title: "Variação adicionada",
        description: "Variação adicionada com sucesso."
      });

      setVariations([...variations, ...data]);
    } catch (error: any) {
      console.error("Error adding variation:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar variação",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVariation = async (variationId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .delete()
        .eq("id", variationId);

      if (error) throw error;
      
      toast({
        title: "Variação removida",
        description: "Variação removida com sucesso."
      });

      setVariations(variations.filter(v => v.id !== variationId));
    } catch (error: any) {
      console.error("Error deleting variation:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover variação",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEAN = async (variationId: string, ean: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .update({ ean })
        .eq("id", variationId);

      if (error) throw error;
      
      toast({
        title: "EAN atualizado",
        description: "Código EAN atualizado com sucesso."
      });

      setVariations(variations.map(v => 
        v.id === variationId ? { ...v, ean } : v
      ));
    } catch (error: any) {
      console.error("Error updating EAN:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar EAN",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gerenciamento de Variações de Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="product-search">Buscar Produto</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="product-search"
                  placeholder="Digite o código ou nome do produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {searchTerm && searchTerm.length >= 3 && (
            <div className="border rounded-md overflow-hidden mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        {isLoading ? "Carregando..." : "Nenhum produto encontrado"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item) => (
                      <TableRow 
                        key={item.ITEM_CODIGO}
                        className={selectedItem === item.ITEM_CODIGO ? "bg-primary/10" : ""}
                      >
                        <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                        <TableCell>{item.DESCRICAO}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleItemSelect(item)}
                          >
                            Selecionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {selectedItem && (
            <>
              <h3 className="text-lg font-medium mb-4">
                Gerenciar Variações do Produto: {items.find(i => i.ITEM_CODIGO === selectedItem)?.DESCRICAO}
              </h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <Label htmlFor="color-select">Cor</Label>
                  <Select value={selectedColor} onValueChange={setSelectedColor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cor" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          <div className="flex items-center gap-2">
                            {color.codigo_hex && (
                              <div 
                                className="w-4 h-4 rounded-full border" 
                                style={{ backgroundColor: color.codigo_hex }}
                              />
                            )}
                            {color.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="size-select">Tamanho</Label>
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    className="w-full"
                    onClick={handleAddVariation}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Variação
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cor</TableHead>
                      <TableHead>Tamanho</TableHead>
                      <TableHead>EAN</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          {isLoading 
                            ? "Carregando..." 
                            : "Nenhuma variação encontrada para este produto"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      variations.map((variation) => (
                        <TableRow key={variation.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {variation.cor?.codigo_hex && (
                                <div 
                                  className="w-4 h-4 rounded-full border" 
                                  style={{ backgroundColor: variation.cor.codigo_hex }}
                                />
                              )}
                              {variation.cor?.nome || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>{variation.tamanho?.nome || "N/A"}</TableCell>
                          <TableCell>
                            <Input 
                              value={variation.ean || ""}
                              onChange={(e) => {
                                setVariations(variations.map(v => 
                                  v.id === variation.id ? { ...v, ean: e.target.value } : v
                                ));
                              }}
                              onBlur={(e) => handleUpdateEAN(variation.id, e.target.value)}
                              placeholder="Código EAN"
                            />
                          </TableCell>
                          <TableCell>{variation.quantidade}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => handleDeleteVariation(variation.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
