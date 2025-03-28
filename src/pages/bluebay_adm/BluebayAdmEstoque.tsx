
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Accordion, 
  AccordionItem,
  AccordionTrigger, 
  AccordionContent 
} from "@/components/ui/accordion";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { exportGroupedDataToExcel } from "@/utils/excelUtils";
import { EstoqueItem, GroupedEstoque } from "@/types/bk/estoque";

const BluebayAdmEstoque = () => {
  const [estoqueItems, setEstoqueItems] = useState<EstoqueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EstoqueItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedEstoque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Define fetchEstoqueData function before using it
  const fetchEstoqueData = async () => {
    try {
      setIsLoading(true);
      
      const { data: estoqueData, error: estoqueError } = await supabase
        .from('BLUEBAY_ESTOQUE')
        .select('*')
        .eq('LOCAL', 1); // Using LOCAL = 1 instead of 3

      if (estoqueError) throw estoqueError;
      
      if (!estoqueData || estoqueData.length === 0) {
        setIsLoading(false);
        toast({
          title: "Nenhum dado de estoque encontrado",
          description: "Não foram encontrados itens de estoque no local 1.",
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

      console.log(`Loaded ${combinedData.length} estoque items from local 1`);
      setEstoqueItems(combinedData);
      filterAndGroupItems(searchTerm, combinedData);
      
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

  // Use useEffect to fetch data on component mount
  useEffect(() => {
    fetchEstoqueData();
  }, []);

  const filterAndGroupItems = (term: string, items: EstoqueItem[] = estoqueItems) => {
    const itemsWithStock = items.filter(
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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterAndGroupItems(value);
  };

  const handleExportEstoque = () => {
    try {
      if (filteredItems.length === 0) {
        toast({
          title: "Nenhum dado para exportar",
          description: "Não existem itens com estoque para exportar.",
          variant: "destructive",
        });
        return;
      }

      // Create a structure for grouped data export
      const exportData: Record<string, any[]> = {};

      groupedItems.forEach(group => {
        // Create array of items for this group
        const items = group.items.map(item => ({
          'Código': item.ITEM_CODIGO,
          'Descrição': item.DESCRICAO,
          'Físico': Number(item.FISICO),
          'Disponível': Number(item.DISPONIVEL),
          'Reservado': Number(item.RESERVADO),
          'Sublocalização': item.SUBLOCAL || '-'
        }));

        // Add group data to export structure
        exportData[group.groupName] = items;
      });

      // Generate filename with current date
      const fileName = `estoque-local1-${new Date().toISOString().split('T')[0]}`;
      
      // Export to Excel
      const exportedRows = exportGroupedDataToExcel(exportData, fileName);
      
      if (exportedRows > 0) {
        toast({
          title: "Exportação concluída",
          description: `Dados de ${filteredItems.length} itens em ${groupedItems.length} grupos exportados com sucesso.`,
        });
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Calculate summary data
  const totalGroups = groupedItems.length;
  const totalItems = filteredItems.length;
  const totalPhysicalStock = filteredItems.reduce((sum, item) => sum + (Number(item.FISICO) || 0), 0);

  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Gestão de Estoque</h1>
          <Button 
            variant="outline" 
            onClick={handleExportEstoque}
            disabled={isLoading || filteredItems.length === 0}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

        {/* Search Filter */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por código, descrição ou grupo..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-2 border border-gray-300 rounded-md pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Total de Grupos</h3>
              <p className="text-2xl font-bold">{totalGroups}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Total de Itens</h3>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Estoque Físico Total</h3>
              <p className="text-2xl font-bold">{totalPhysicalStock.toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Estoque Items List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : groupedItems.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhum item com estoque encontrado para esta busca."
                : "Nenhum item com estoque disponível no momento."}
            </p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {groupedItems.map((group, index) => (
              <EstoqueGroupItem key={index} group={group} index={index} />
            ))}
          </Accordion>
        )}
      </div>
    </main>
  );
};

// EstoqueGroupItem Component
const EstoqueGroupItem = ({ group, index }: { group: GroupedEstoque; index: number }) => {
  return (
    <AccordionItem value={`group-${index}`} className="bg-white rounded-lg shadow mb-4 overflow-hidden">
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
  );
};

export default BluebayAdmEstoque;
