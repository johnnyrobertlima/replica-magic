
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EstoqueItem, GroupedEstoque } from "@/types/bk/estoque";

export const useEstoqueData = () => {
  const [estoqueItems, setEstoqueItems] = useState<EstoqueItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<EstoqueItem[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedEstoque[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchEstoqueData();
  }, []);

  useEffect(() => {
    if (estoqueItems.length > 0) {
      filterAndGroupItems(searchTerm);
    }
  }, [searchTerm, estoqueItems]);

  const filterAndGroupItems = (term: string) => {
    // Removed filter for only items with stock to show all items
    // This might be why you're seeing fewer items than expected
    const allItems = estoqueItems;
    
    const filtered = term 
      ? allItems.filter(
          (item) =>
            item.ITEM_CODIGO.toLowerCase().includes(term.toLowerCase()) ||
            (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(term.toLowerCase())) ||
            (item.GRU_DESCRICAO && item.GRU_DESCRICAO.toLowerCase().includes(term.toLowerCase()))
        )
      : allItems;
    
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
      
      // Fetch up to 5000 items instead of the default limit
      const { data: estoqueData, error: estoqueError } = await supabase
        .from('BLUEBAY_ESTOQUE')
        .select('*')
        .eq('LOCAL', 1)
        .limit(5000);

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
      
      // Adjust batch size if needed 
      const batchSize = 500;
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
    filteredItems,
    groupedItems,
    isLoading,
    searchTerm,
    setSearchTerm,
    filterAndGroupItems,
    fetchEstoqueData
  };
};
