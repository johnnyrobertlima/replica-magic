
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
    // Filtrar itens com estoque físico maior que zero
    const itemsWithStock = estoqueItems.filter(
      item => Number(item.FISICO) > 0
    );
    
    console.log(`Total de itens com estoque físico > 0: ${itemsWithStock.length}`);
    
    const filtered = term 
      ? itemsWithStock.filter(
          (item) =>
            item.ITEM_CODIGO.toLowerCase().includes(term.toLowerCase()) ||
            (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(term.toLowerCase())) ||
            (item.GRU_DESCRICAO && item.GRU_DESCRICAO.toLowerCase().includes(term.toLowerCase()))
        )
      : itemsWithStock;
    
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

  // Função para buscar dados de estoque utilizando paginação para evitar limites
  const fetchEstoqueData = async () => {
    try {
      setIsLoading(true);
      
      console.log("🔍 Iniciando busca de dados de estoque no LOCAL 1");
      
      // Array para armazenar todos os dados do estoque
      let allEstoqueData: any[] = [];
      let hasMore = true;
      let page = 0;
      const pageSize = 1000; // Buscar 1000 itens por vez
      
      // Usar paginação para buscar todos os registros
      while (hasMore) {
        console.log(`📄 Buscando página ${page + 1} de estoque (itens ${page * pageSize} a ${(page + 1) * pageSize - 1})`);
        
        const { data: estoquePageData, error: estoqueError } = await supabase
          .from('BLUEBAY_ESTOQUE')
          .select('*')
          .eq('LOCAL', 1)
          .range(page * pageSize, (page + 1) * pageSize - 1);
          
        if (estoqueError) {
          console.error(`❌ Erro ao buscar página ${page + 1} do estoque:`, estoqueError);
          throw estoqueError;
        }
        
        if (!estoquePageData || estoquePageData.length === 0) {
          hasMore = false;
        } else {
          allEstoqueData = [...allEstoqueData, ...estoquePageData];
          page++;
          console.log(`✅ Página ${page} processada, total de itens até agora: ${allEstoqueData.length}`);
          
          // Se recebemos menos itens que o tamanho da página, não há mais dados
          if (estoquePageData.length < pageSize) {
            hasMore = false;
          }
        }
      }
      
      console.log(`📊 Total de registros de estoque encontrados: ${allEstoqueData.length}`);
      
      if (allEstoqueData.length === 0) {
        setIsLoading(false);
        toast({
          title: "Nenhum dado de estoque encontrado",
          description: "Não foram encontrados itens de estoque no local 1.",
          variant: "destructive",
        });
        return;
      }
      
      // Extrair todos os códigos de itens únicos
      const itemCodes = [...new Set(allEstoqueData.map(item => item.ITEM_CODIGO))];
      console.log(`📋 Total de códigos de itens únicos no estoque: ${itemCodes.length}`);
      
      // Dividir em lotes menores para consulta
      const batchSize = 500; // Tamanho de lote reduzido para evitar problemas
      const batches = [];
      
      for (let i = 0; i < itemCodes.length; i += batchSize) {
        batches.push(itemCodes.slice(i, i + batchSize));
      }
      
      console.log(`📦 Dividido em ${batches.length} lotes com até ${batchSize} itens cada`);
      
      // Processar todos os lotes sequencialmente
      let allItemsData: any[] = [];
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`⏳ Processando lote ${i+1} de ${batches.length} (${batch.length} itens)`);
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('BLUEBAY_ITEM')
          .select('ITEM_CODIGO, DESCRICAO, GRU_DESCRICAO')
          .in('ITEM_CODIGO', batch);

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

      // Combinar os dados
      const combinedData: EstoqueItem[] = allEstoqueData.map(estoque => {
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
