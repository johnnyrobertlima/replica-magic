
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
    // Não filtrar itens por estoque para mostrar todos os itens
    const allItems = estoqueItems;
    
    console.log(`Total de itens no estado estoqueItems: ${allItems.length}`);
    
    const filtered = term 
      ? allItems.filter(
          (item) =>
            item.ITEM_CODIGO.toLowerCase().includes(term.toLowerCase()) ||
            (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(term.toLowerCase())) ||
            (item.GRU_DESCRICAO && item.GRU_DESCRICAO.toLowerCase().includes(term.toLowerCase()))
        )
      : allItems;
    
    console.log(`Total de itens após filtro: ${filtered.length}`);
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
    
    console.log(`Total de grupos após agrupamento: ${groupedArray.length}`);
    console.log(`Total de itens em todos os grupos: ${groupedArray.reduce((sum, group) => sum + group.totalItems, 0)}`);
    
    setGroupedItems(groupedArray);
  };

  const fetchEstoqueData = async () => {
    try {
      setIsLoading(true);
      
      console.log("🔍 Iniciando busca de dados de estoque no LOCAL 1");
      
      // Consulta para obter TODOS os registros de estoque sem nenhuma limitação
      // Importante: Supabase tem um limite de 1000 registros por padrão, vamos desabilitá-lo
      const { data: estoqueData, error: estoqueError } = await supabase
        .from('BLUEBAY_ESTOQUE')
        .select('*')
        .eq('LOCAL', 1)
        .limit(100000); // Definindo um limite muito alto para garantir que todos os registros sejam retornados

      if (estoqueError) {
        console.error("❌ Erro ao buscar dados do estoque:", estoqueError);
        throw estoqueError;
      }
      
      if (!estoqueData || estoqueData.length === 0) {
        setIsLoading(false);
        toast({
          title: "Nenhum dado de estoque encontrado",
          description: "Não foram encontrados itens de estoque no local 1.",
          variant: "destructive",
        });
        return;
      }
      
      console.log(`✅ Total de registros de estoque encontrados: ${estoqueData.length}`);
      
      // Extrair todos os códigos de itens
      const itemCodes = estoqueData.map(item => item.ITEM_CODIGO);
      console.log(`📋 Total de códigos de itens no estoque: ${itemCodes.length}`);
      
      // Aumentar ainda mais o tamanho dos lotes para garantir processamento de todos os itens
      const batchSize = 10000; // Tamanho de lote muito maior
      const batches = [];
      
      // Dividir os códigos em lotes
      for (let i = 0; i < itemCodes.length; i += batchSize) {
        batches.push(itemCodes.slice(i, i + batchSize));
      }
      
      console.log(`📦 Dividido em ${batches.length} lotes com até ${batchSize} itens cada`);
      
      // Processar todos os lotes sequencialmente
      let allItemsData = [];
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`⏳ Processando lote ${i+1} de ${batches.length} (${batch.length} itens)`);
        
        // Consulta com todos os códigos do lote sem limites
        const { data: itemsData, error: itemsError } = await supabase
          .from('BLUEBAY_ITEM')
          .select('ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO')
          .in('ITEM_CODIGO', batch)
          .limit(100000); // Definindo um limite muito alto para garantir que todos os registros sejam retornados

        if (itemsError) {
          console.error(`❌ Erro no lote ${i+1}:`, itemsError);
          throw itemsError;
        }
        
        if (itemsData) {
          allItemsData = [...allItemsData, ...itemsData];
          console.log(`✅ Lote ${i+1} processado, total de itens até agora: ${allItemsData.length}`);
        }
      }

      console.log(`📊 Total de itens obtidos do BLUEBAY_ITEM: ${allItemsData.length}`);

      // Criar mapa para acesso rápido às informações dos itens
      const itemMap = new Map();
      allItemsData.forEach(item => {
        itemMap.set(item.ITEM_CODIGO, {
          DESCRICAO: item.DESCRICAO || 'Sem descrição',
          GRU_DESCRICAO: item.GRU_DESCRICAO || 'Sem grupo'
        });
      });

      // Combinar os dados sem nenhuma limitação
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

      console.log(`🎯 Carregados ${combinedData.length} itens de estoque do local 1`);
      setEstoqueItems(combinedData);
      
    } catch (error: any) {
      console.error("❌ Erro ao carregar dados de estoque:", error);
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
