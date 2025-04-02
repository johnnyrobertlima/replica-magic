
import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { StockItem, fetchStockSalesAnalytics, fetchStockSalesAnalyticsWithDirectQueries } from "@/services/bluebay/stockSalesAnalyticsService";
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
