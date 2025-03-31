
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { EstoqueItem } from "@/types/bk/estoque";
import { 
  fetchEstoquePage, 
  fetchItemDetailsInBatches, 
  createItemDetailsMap, 
  combineEstoqueWithItemDetails 
} from "@/utils/bluebay/analiseDeCompraUtils";

export const useAnaliseDeCompraFetching = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [estoqueItems, setEstoqueItems] = useState<EstoqueItem[]>([]);
  const { toast } = useToast();

  // Função para buscar dados de estoque utilizando paginação para evitar limites
  const fetchEstoqueData = async () => {
    try {
      setIsLoading(true);
      
      console.log("🔍 Iniciando busca de dados para análise de compra no LOCAL 1");
      
      // Array para armazenar todos os dados do estoque
      let allEstoqueData: any[] = [];
      let hasMore = true;
      let page = 0;
      const pageSize = 1000; // Buscar 1000 itens por vez
      
      // Usar paginação para buscar todos os registros
      while (hasMore) {
        const { estoquePageData, hasMore: hasMoreData } = await fetchEstoquePage(page, pageSize);
        
        if (!estoquePageData || estoquePageData.length === 0) {
          hasMore = false;
        } else {
          allEstoqueData = [...allEstoqueData, ...estoquePageData];
          page++;
          console.log(`✅ Página ${page} processada, total de itens até agora: ${allEstoqueData.length}`);
          
          // Se recebemos menos itens que o tamanho da página, não há mais dados
          hasMore = hasMoreData;
        }
      }
      
      console.log(`📊 Total de registros de análise de compra encontrados: ${allEstoqueData.length}`);
      
      if (allEstoqueData.length === 0) {
        setIsLoading(false);
        toast({
          title: "Nenhum dado de análise de compra encontrado",
          description: "Não foram encontrados itens de análise de compra no local 1.",
          variant: "destructive",
        });
        return;
      }
      
      // Extrair todos os códigos de itens únicos
      const itemCodes = [...new Set(allEstoqueData.map(item => item.ITEM_CODIGO))];
      console.log(`📋 Total de códigos de itens únicos na análise de compra: ${itemCodes.length}`);
      
      // Buscar detalhes dos itens em lotes
      const allItemsData = await fetchItemDetailsInBatches(itemCodes);
      console.log(`📊 Total de itens obtidos do BLUEBAY_ITEM: ${allItemsData.length}`);

      // Criar mapa para acesso rápido às informações dos itens
      const itemMap = createItemDetailsMap(allItemsData);

      // Combinar os dados
      const combinedData = combineEstoqueWithItemDetails(allEstoqueData, itemMap);

      console.log(`🎯 Carregados ${combinedData.length} itens de análise de compra do local 1`);
      setEstoqueItems(combinedData);
      
    } catch (error: any) {
      console.error("❌ Erro ao carregar dados de análise de compra:", error);
      toast({
        title: "Erro ao carregar dados de análise de compra",
        description: error.message || "Não foi possível carregar os dados de análise de compra.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    estoqueItems,
    isLoading,
    fetchEstoqueData
  };
};
