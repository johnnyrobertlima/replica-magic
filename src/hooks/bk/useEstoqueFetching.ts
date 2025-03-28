
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { EstoqueItem } from "@/types/bk/estoque";
import { 
  fetchEstoqueData, 
  fetchItemDetailsInBatches, 
  createItemDetailsMap, 
  combineEstoqueWithItemDetails 
} from "@/utils/bk/estoqueUtils";

export const useEstoqueFetching = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [estoqueItems, setEstoqueItems] = useState<EstoqueItem[]>([]);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      const { estoqueData } = await fetchEstoqueData(3); // Local 3 para BK
      
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
      const allItemsData = await fetchItemDetailsInBatches(itemCodes);

      const itemMap = createItemDetailsMap(allItemsData);
      const combinedData = combineEstoqueWithItemDetails(estoqueData, itemMap);

      console.log(`Loaded ${combinedData.length} estoque items for Local 3`);
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

  return {
    estoqueItems,
    isLoading,
    fetchEstoqueData: fetchData
  };
};
