
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { StockItem, fetchStockSalesAnalytics } from "@/services/bluebay/stockSalesAnalyticsService";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "./useStockSalesFilters";

export const useStockSalesData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<StockItem[]>([]);
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
          // Use the enhanced fetching with fallbacks
          const data = await fetchStockSalesAnalytics(startDateFormatted, endDateFormatted);
          
          // Check if data is using sample data
          setUsingSampleData(data.length > 0 && data[0].hasOwnProperty('isSampleData'));
          
          // Ensure we don't have duplicate items by using a Map with ITEM_CODIGO as key
          const uniqueItemsMap = new Map<string, StockItem>();
          
          data.forEach(item => {
            if (!uniqueItemsMap.has(item.ITEM_CODIGO)) {
              uniqueItemsMap.set(item.ITEM_CODIGO, item);
            } else {
              console.log(`Duplicate item found and skipped: ${item.ITEM_CODIGO}`);
            }
          });
          
          const uniqueItems = Array.from(uniqueItemsMap.values());
          setItems(uniqueItems);
          
          if (uniqueItems.length === 0) {
            toast({
              title: "Nenhum dado encontrado",
              description: "Não foram encontrados dados para o período selecionado.",
              variant: "default",
            });
          } else {
            toast({
              title: "Dados carregados",
              description: `Carregados ${uniqueItems.length} registros de estoque e vendas.`,
              variant: "default",
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados de estoque-vendas:", error);
          setError("Falha ao carregar dados de estoque-vendas");
          setItems([]);
          
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do relatório. Verifique o console para mais detalhes.",
            variant: "destructive",
          });
        }
      } else {
        console.warn("Intervalo de datas incompleto");
        setItems([]);
      }
      
    } catch (err) {
      console.error("Erro ao carregar dados de estoque-vendas:", err);
      setError("Falha ao carregar dados de estoque-vendas");
      setItems([]);
      
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateDateRange = (newDateRange: DateRange) => {
    console.log(`Atualizando intervalo de datas`, newDateRange);
    setDateRange(newDateRange);
  };

  const refreshData = () => {
    console.log("Atualizando dados do relatório");
    loadData();
  };

  // Trigger data loading when date range changes
  useEffect(() => {
    loadData();
  }, [dateRange.startDate, dateRange.endDate]);

  return {
    isLoading,
    items,
    error,
    dateRange,
    updateDateRange,
    refreshData,
    usingSampleData
  };
};
