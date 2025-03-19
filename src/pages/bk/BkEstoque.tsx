
import { useState, useEffect } from "react";
import { BkMenu } from "@/components/bk/BkMenu";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Loader2, SearchIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EstoqueItem {
  ITEM_CODIGO: string;
  DESCRICAO: string;
  FISICO: number;
  DISPONIVEL: number;
  RESERVADO: number;
  LOCAL: number;
  SUBLOCAL: string;
}

const BkEstoque = () => {
  const [estoqueItems, setEstoqueItems] = useState<EstoqueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EstoqueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEstoqueData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = estoqueItems.filter(
        (item) =>
          item.ITEM_CODIGO.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(estoqueItems);
    }
  }, [searchTerm, estoqueItems]);

  const fetchEstoqueData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch estoque data with JOIN to get item descriptions
      const { data, error } = await supabase
        .from('BLUEBAY_ESTOQUE')
        .select(`
          ITEM_CODIGO,
          FISICO,
          DISPONIVEL,
          RESERVADO,
          LOCAL,
          SUBLOCAL,
          BLUEBAY_ITEM!inner (DESCRICAO)
        `)
        .eq('LOCAL', 3);

      if (error) throw error;

      // Transform the data to combine fields from both tables
      const transformedData = data.map(item => ({
        ITEM_CODIGO: item.ITEM_CODIGO,
        DESCRICAO: item.BLUEBAY_ITEM.DESCRICAO,
        FISICO: item.FISICO,
        DISPONIVEL: item.DISPONIVEL,
        RESERVADO: item.RESERVADO,
        LOCAL: item.LOCAL,
        SUBLOCAL: item.SUBLOCAL
      }));

      setEstoqueItems(transformedData);
      setFilteredItems(transformedData);
      
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

  return (
    <div className="min-h-screen bg-gray-50">
      <BkMenu />

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-primary mb-6">Consulta de Estoque</h1>

        <div className="mb-6 relative">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar por código ou descrição do item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-1/2"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
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
                {filteredItems.map((item) => (
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
        ) : (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhum item encontrado para esta busca."
                : "Nenhum item de estoque disponível no momento."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BkEstoque;
