
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { StockItem, fetchStockSalesAnalytics, fetchStockSalesAnalyticsWithDirectQueries } from "@/services/bluebay/stockSalesAnalyticsService";
import { useToast } from "@/hooks/use-toast";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export const useStockSalesAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<StockItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockItem,
    direction: 'asc' | 'desc'
  }>({ key: 'DESCRICAO', direction: 'asc' });
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30), // Default to 30 days ago
    endDate: new Date() // Today
  });
  const [usingSampleData, setUsingSampleData] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setUsingSampleData(false);
      
      if (dateRange.startDate && dateRange.endDate) {
        const startDateFormatted = format(dateRange.startDate, 'yyyy-MM-dd');
        const endDateFormatted = format(dateRange.endDate, 'yyyy-MM-dd');
        
        console.log(`Carregando relatório de estoque-vendas para o período: ${startDateFormatted} até ${endDateFormatted}`);
        
        try {
          // Try using the regular function which now has a fallback for test data
          const data = await fetchStockSalesAnalytics(startDateFormatted, endDateFormatted);
          setItems(data);
          
          if (data.length === 0) {
            // Mostrar mensagem quando não há dados reais, mas não considerar isso um erro
            setUsingSampleData(true);
            toast({
              title: "Nenhum dado encontrado",
              description: "Não foram encontrados dados para o período selecionado.",
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados de estoque-vendas:", error);
          setError("Falha ao carregar dados de estoque-vendas");
          
          // Ainda assim, tentar usar dados de exemplo
          const fallbackData = await fetchStockSalesAnalyticsWithDirectQueries(startDateFormatted, endDateFormatted);
          setItems(fallbackData);
          
          if (fallbackData.length > 0) {
            toast({
              title: "Dados limitados disponíveis",
              description: "Ocorreu um erro ao carregar dados completos. Exibindo dados limitados disponíveis.",
              variant: "default",
            });
          } else {
            setUsingSampleData(true);
            toast({
              title: "Erro",
              description: "Não foi possível carregar os dados do relatório. Tente novamente mais tarde.",
              variant: "destructive",
            });
          }
        }
      } else {
        console.warn("Intervalo de datas incompleto");
        setItems([]);
      }
      
    } catch (err) {
      console.error("Erro ao carregar dados de estoque-vendas:", err);
      setError("Falha ao carregar dados de estoque-vendas");
      setUsingSampleData(true);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (items.length > 0) {
      const groups = [...new Set(items.map(item => item.GRU_DESCRICAO).filter(Boolean))];
      setAvailableGroups(groups.sort());
    } else {
      setAvailableGroups([]);
    }
  }, [items]);

  useEffect(() => {
    let result = [...items];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.ITEM_CODIGO && item.ITEM_CODIGO.toLowerCase().includes(term)) ||
        (item.DESCRICAO && item.DESCRICAO.toLowerCase().includes(term))
      );
    }
    
    if (groupFilter && groupFilter !== "all") {
      result = result.filter(item => item.GRU_DESCRICAO === groupFilter);
    }
    
    result.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === undefined || aValue === null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue === undefined || bValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortConfig.direction === 'asc'
          ? (aValue < bValue ? -1 : aValue > bValue ? 1 : 0)
          : (bValue < aValue ? -1 : bValue > aValue ? 1 : 0);
      }
    });
    
    setFilteredItems(result);
  }, [items, searchTerm, groupFilter, sortConfig]);

  const refreshData = () => {
    console.log("Atualizando dados do relatório");
    loadData();
  };

  const updateDateRange = (newDateRange: DateRange) => {
    console.log(`Atualizando intervalo de datas`, newDateRange);
    setDateRange(newDateRange);
  };

  const handleSort = (key: keyof StockItem) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setGroupFilter("all");
  };

  const getSummaryStats = () => {
    if (filteredItems.length === 0) return null;
    
    return {
      totalItems: filteredItems.length,
      totalStock: filteredItems.reduce((sum, item) => sum + (item.FISICO || 0), 0),
      totalSales: filteredItems.reduce((sum, item) => sum + (item.QTD_VENDIDA || 0), 0),
      totalValue: filteredItems.reduce((sum, item) => sum + (item.VALOR_TOTAL_VENDIDO || 0), 0),
      lowStockItems: filteredItems.filter(item => (item.FISICO || 0) < 5).length,
      newProducts: filteredItems.filter(item => item.PRODUTO_NOVO).length,
      top10Items: filteredItems.filter(item => (item.RANKING || 0) <= 10).length
    };
  };

  return {
    isLoading,
    items: filteredItems,
    error,
    refreshData,
    dateRange,
    updateDateRange,
    searchTerm,
    setSearchTerm,
    groupFilter,
    setGroupFilter,
    availableGroups,
    sortConfig,
    handleSort,
    clearFilters,
    getSummaryStats,
    usingSampleData
  };
};
