import { useState, useEffect } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, SearchIcon, PackageOpen, Package, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEstoqueExport } from "@/hooks/bk/useEstoqueExport";
import { EstoqueItem, GroupedEstoque } from "@/types/bk/estoque";

const BkEstoque = () => {
  const [estoqueItems, setEstoqueItems] = useState<EstoqueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EstoqueItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedEstoque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { handleExportEstoque } = useEstoqueExport();

  useEffect(() => {
    fetchEstoqueData();
  }, []);

  useEffect(() => {
    if (estoqueItems.length > 0) {
      filterAndGroupItems(searchTerm);
    }
  }, [searchTerm, estoqueItems]);

  const filterAndGroupItems = (term: string) => {
    const itemsWithStock = estoqueItems.filter(
      item => (Number(item.FISICO) > 0 || Number(item.DISPONIVEL) > 0)
    );
    
    const filtered = term 
      ? itemsWithStock.filter(
          (item) =>
            item.ITEM_CODIGO.toLowerCase().includes(term.toLowerCase()) ||
            (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(term.toLowerCase())) ||
            (item.GRU_DESCRICAO && item.GRU_DESCRICAO.toLowerCase().includes(term.toLowerCase()))
        )
      : itemsWithStock;
    
    setFilteredItems(filtered);
    
    const grouped: Record<string, EstoqueItem[]> = {};
    
    filtered.forEach(item => {
      const groupName = item.GRU_DESCRICAO || 'Sem Grupo';
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(item);
    });
    
    const groupedArray: GroupedEstoque[] = Object.entries(grouped).map(([groupName, items]) => ({
      groupName,
      items,
      totalItems: items.length,
      totalFisico: items.reduce((sum, item) => sum + (Number(item.FISICO) || 0), 0)
    }));
    
    groupedArray.sort((a, b) => a.groupName.localeCompare(b.groupName));
    
    setGroupedItems(groupedArray);
  };

  const fetchEstoqueData = async () => {
    try {
      setIsLoading(true);
      
      const { data: estoqueData, error: estoqueError } = await supabase
        .from('BLUEBAY_ESTOQUE')
        .select('*')
        .eq('LOCAL', 3);

      if (estoqueError) throw estoqueError;
      
      if (!estoqueData || estoqueData.length === 0) {
        setIsLoading(false);
        toast({
          title: "Nenhum dado de estoque encontrado",
          description: "Não foram encontrados itens de estoque no local 3.",
          variant: "destructive",
        });
        return;
      }
      
      const itemCodes = estoqueData.map(item => item.ITEM_CODIGO);
      
      const batchSize = 200;
      const batches = [];
      for (let i = 0; i < itemCodes.length; i += batchSize) {
        batches.push(itemCodes.slice(i, i + batchSize));
      }
      
      let allItemsData = [];
      for (const batch of batches) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('BLUEBAY_ITEM')
          .select('ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO')
          .in('ITEM_CODIGO', batch);

        if (itemsError) throw itemsError;
        
        if (itemsData) {
          allItemsData = [...allItemsData, ...itemsData];
        }
      }

      const itemMap = new Map();
      allItemsData.forEach(item => {
        itemMap.set(item.ITEM_CODIGO, {
          DESCRICAO: item.DESCRICAO || 'Sem descrição',
          GRU_DESCRICAO: item.GRU_DESCRICAO || 'Sem grupo'
        });
      });

      const combinedData: EstoqueItem[] = estoqueData.map(estoque => {
        const itemInfo = itemMap.get(estoque.ITEM_CODIGO) || { DESCRICAO: 'Sem descrição', GRU_DESCRICAO: 'Sem grupo' };
        
        return {
          ITEM_CODIGO: estoque.ITEM_CODIGO,
          DESCRICAO: itemInfo.DESCRICAO,
          GRU_DESCRICAO: itemInfo.GRU_DESCRICAO,
          FISICO: estoque.FISICO,
          DISPONIVEL: estoque.DISPONIVEL,
          RESERVADO: estoque.RESERVADO,
          LOCAL: estoque.LOCAL,
          SUBLOCAL: estoque.SUBLOCAL
        };
      });

      console.log(`Loaded ${combinedData.length} estoque items`);
      setEstoqueItems(combinedData);
      
    } catch (error: any) {
      console.error("Error fetching estoque data:", error);
      toast({
        title: "Erro ao carregar dados de estoque",
        description: error.message || "Não foi possível carregar os dados do estoque.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportClick = () => {
    handleExportEstoque(groupedItems, filteredItems);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BkMenu />

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Gestão de Estoque</h1>
          <Button 
            variant="outline" 
            onClick={handleExportClick}
            disabled={isLoading || filteredItems.length === 0}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Consulta de Estoque (Somente itens com estoque físico ou disponível)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por código, descrição ou grupo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : groupedItems.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <PackageOpen className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Grupos</p>
                      <p className="text-2xl font-bold">{groupedItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Itens</p>
                      <p className="text-2xl font-bold">{filteredItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-primary mr-4" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estoque Físico Total</p>
                      <p className="text-2xl font-bold">
                        {filteredItems.reduce((sum, item) => sum + (Number(item.FISICO) || 0), 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Accordion type="multiple" className="w-full">
              {groupedItems.map((group, index) => (
                <AccordionItem key={index} value={`group-${index}`} className="bg-white rounded-lg shadow mb-4 overflow-hidden">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="px-2 py-1 rounded-full bg-primary/10">
                          {group.totalItems}
                        </Badge>
                        <span className="font-medium">{group.groupName}</span>
                      </div>
                      <div className="hidden md:flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Estoque Físico</p>
                          <span className="font-medium">{group.totalFisico}</span>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-white rounded-lg overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Código</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Físico</TableHead>
                            <TableHead className="text-right">Disponível</TableHead>
                            <TableHead className="text-right">Reservado</TableHead>
                            <TableHead>Sublocalização</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.items.map((item) => (
                            <TableRow key={item.ITEM_CODIGO}>
                              <TableCell className="font-medium">{item.ITEM_CODIGO}</TableCell>
                              <TableCell>{item.DESCRICAO}</TableCell>
                              <TableCell className="text-right">{item.FISICO}</TableCell>
                              <TableCell className="text-right">{item.DISPONIVEL}</TableCell>
                              <TableCell className="text-right">{item.RESERVADO}</TableCell>
                              <TableCell>{item.SUBLOCAL}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhum item com estoque encontrado para esta busca."
                : "Nenhum item com estoque disponível no momento."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BkEstoque;
