
import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Edit, Save, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { debounce } from "lodash";

interface ItemData {
  ITEM_CODIGO: string;
  DESCRICAO: string;
  MATRIZ: number;
  FILIAL: number;
}

interface Color {
  id: string;
  nome: string;
  codigo_hex?: string;
}

interface Size {
  id: string;
  nome: string;
  ordem?: number;
}

interface Variation {
  id: string;
  item_codigo: string;
  id_cor: string;
  id_tamanho: string;
  ean: string;
  quantidade: number;
  cor_nome?: string;
  tamanho_nome?: string;
}

export const ProductVariationsManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<ItemData[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [editingVariation, setEditingVariation] = useState<string | null>(null);
  const [editEan, setEditEan] = useState("");
  const [editQuantity, setEditQuantity] = useState(0);
  const { toast } = useToast();

  // Fetch items that match the search term
  const searchItems = useCallback(async (search: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("BLUEBAY_ITEM")
        .select("ITEM_CODIGO, DESCRICAO, MATRIZ, FILIAL")
        .order("DESCRICAO");

      if (search) {
        query = query.or(`ITEM_CODIGO.ilike.%${search}%,DESCRICAO.ilike.%${search}%`);
      }

      query = query.limit(30);

      const { data, error } = await query;

      if (error) throw error;
      
      setItems(data || []);
    } catch (error: any) {
      console.error("Error searching items:", error);
      toast({
        variant: "destructive",
        title: "Erro ao buscar itens",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      searchItems(value);
    }, 500),
    [searchItems]
  );

  // Fetch colors and sizes on component mount
  useEffect(() => {
    const fetchColorsAndSizes = async () => {
      setIsLoading(true);
      try {
        // Fetch colors
        const { data: colorData, error: colorError } = await supabase
          .from("Cor")
          .select("*")
          .order("nome");

        if (colorError) throw colorError;
        setColors(colorData || []);

        // Fetch sizes
        const { data: sizeData, error: sizeError } = await supabase
          .from("Tamanho")
          .select("*")
          .order("ordem", { ascending: true });

        if (sizeError) throw sizeError;
        setSizes(sizeData || []);
      } catch (error: any) {
        console.error("Error fetching colors and sizes:", error);
        toast({
          variant: "destructive",
          title: "Erro ao buscar cores e tamanhos",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchColorsAndSizes();
    searchItems("");
  }, [searchItems, toast]);

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
            id,
            item_codigo,
            id_cor,
            id_tamanho,
            ean,
            quantidade,
            Cor (nome),
            Tamanho (nome)
          `)
          .eq("item_codigo", selectedItem);

        if (error) throw error;

        // Transform data to include color and size names
        const transformedData = data?.map(item => ({
          id: item.id,
          item_codigo: item.item_codigo,
          id_cor: item.id_cor,
          id_tamanho: item.id_tamanho,
          ean: item.ean || "",
          quantidade: item.quantidade || 0,
          cor_nome: item.Cor ? item.Cor.nome : "",
          tamanho_nome: item.Tamanho ? item.Tamanho.nome : ""
        }));

        setVariations(transformedData || []);
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

  const handleSelectItem = (item: ItemData) => {
    setSelectedItem(item.ITEM_CODIGO);
  };

  const handleAddVariation = async () => {
    if (!selectedItem || !selectedColor || !selectedSize) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Selecione um item, cor e tamanho para adicionar uma variação",
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
        description: "Esta combinação de cor e tamanho já existe para este item",
      });
      return;
    }

    setIsLoading(true);
    
    // Get item data to get matriz and filial
    const itemData = items.find(i => i.ITEM_CODIGO === selectedItem);
    
    if (!itemData) {
      toast({
        variant: "destructive",
        title: "Item não encontrado",
        description: "Não foi possível encontrar os dados do item selecionado",
      });
      setIsLoading(false);
      return;
    }

    try {
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
          id,
          item_codigo,
          id_cor,
          id_tamanho,
          ean,
          quantidade,
          Cor (nome),
          Tamanho (nome)
        `);

      if (error) throw error;

      if (data && data[0]) {
        // Transform data to include color and size names
        const newVariation = {
          id: data[0].id,
          item_codigo: data[0].item_codigo,
          id_cor: data[0].id_cor,
          id_tamanho: data[0].id_tamanho,
          ean: data[0].ean || "",
          quantidade: data[0].quantidade || 0,
          cor_nome: data[0].Cor ? data[0].Cor.nome : "",
          tamanho_nome: data[0].Tamanho ? data[0].Tamanho.nome : ""
        };

        setVariations([...variations, newVariation]);
        
        toast({
          title: "Variação adicionada",
          description: "A variação foi adicionada com sucesso",
        });
      }
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

  const handleEditStart = (variation: Variation) => {
    setEditingVariation(variation.id);
    setEditEan(variation.ean);
    setEditQuantity(variation.quantidade);
  };

  const handleSaveEdit = async () => {
    if (!editingVariation) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .update({
          ean: editEan,
          quantidade: editQuantity
        })
        .eq("id", editingVariation);

      if (error) throw error;

      // Update local state
      setVariations(
        variations.map(v => 
          v.id === editingVariation 
            ? { ...v, ean: editEan, quantidade: editQuantity } 
            : v
        )
      );

      setEditingVariation(null);
      toast({
        title: "Alterações salvas",
        description: "As alterações foram salvas com sucesso",
      });
    } catch (error: any) {
      console.error("Error saving variation:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar alterações",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingVariation(null);
  };

  const handleDeleteVariation = async (variationId: string) => {
    if (!variationId) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("BLUEBAY_ITEM_VARIACAO")
        .delete()
        .eq("id", variationId);

      if (error) throw error;

      // Update local state
      setVariations(variations.filter(v => v.id !== variationId));
      
      toast({
        title: "Variação excluída",
        description: "A variação foi excluída com sucesso",
      });
    } catch (error: any) {
      console.error("Error deleting variation:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir variação",
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
          <CardTitle>Gerenciamento de Variações</CardTitle>
          <CardDescription>
            Adicione e gerencie variações de cores e tamanhos para seus produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Search section */}
            <div>
              <Label htmlFor="search-item">Buscar Item</Label>
              <div className="flex items-center mt-1.5">
                <Input
                  id="search-item"
                  placeholder="Digite o código ou descrição do item"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  className="flex-1"
                />
                <Button 
                  variant="default" 
                  className="ml-2"
                  onClick={() => searchItems(searchTerm)}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>
            
            {/* Search results */}
            <div>
              <h3 className="text-sm font-medium mb-2">Resultados da busca</h3>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : items.length > 0 ? (
                <div className="max-h-[200px] overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="w-[100px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.ITEM_CODIGO}>
                          <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                          <TableCell>{item.DESCRICAO}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSelectItem(item)}
                            >
                              Selecionar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="border rounded-md p-4 text-center text-muted-foreground">
                  Nenhum item encontrado.
                </div>
              )}
            </div>
            
            {/* Selected item */}
            {selectedItem && (
              <div>
                <h3 className="text-sm font-medium mb-2">Item selecionado</h3>
                <div className="border rounded-md p-4">
                  <Badge className="mb-2">Código: {selectedItem}</Badge>
                  <p className="text-lg font-medium">
                    {items.find(i => i.ITEM_CODIGO === selectedItem)?.DESCRICAO}
                  </p>
                </div>
              </div>
            )}
            
            {/* Add variation */}
            {selectedItem && (
              <div>
                <h3 className="text-sm font-medium mb-2">Adicionar variação</h3>
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
                            <div className="flex items-center">
                              {color.codigo_hex && (
                                <div 
                                  className="w-4 h-4 mr-2 rounded-full border"
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
              </div>
            )}
            
            {/* Variations list */}
            {selectedItem && (
              <div>
                <h3 className="text-sm font-medium mb-2">Variações do Item</h3>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : variations.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cor</TableHead>
                          <TableHead>Tamanho</TableHead>
                          <TableHead>EAN</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead className="w-[120px] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {variations.map((variation) => (
                          <TableRow key={variation.id}>
                            <TableCell>{variation.cor_nome}</TableCell>
                            <TableCell>{variation.tamanho_nome}</TableCell>
                            <TableCell>
                              {editingVariation === variation.id ? (
                                <Input
                                  value={editEan}
                                  onChange={(e) => setEditEan(e.target.value)}
                                  placeholder="Código EAN"
                                />
                              ) : (
                                variation.ean || "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {editingVariation === variation.id ? (
                                <Input
                                  type="number"
                                  value={editQuantity}
                                  onChange={(e) => setEditQuantity(Number(e.target.value))}
                                  placeholder="Quantidade"
                                />
                              ) : (
                                variation.quantidade
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {editingVariation === variation.id ? (
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleSaveEdit}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditStart(variation)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteVariation(variation.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="border rounded-md p-4 text-center text-muted-foreground">
                    Nenhuma variação encontrada para este item.
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
