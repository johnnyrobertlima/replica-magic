
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
    startDate: subDays(new Date(), 90), // Get data for a wider date range
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
          
          // Process the data to ensure uniqueness and integrity
          const processedData = processDataForDisplay(data);
          
          // Update the state with the processed data
          updateStateWithData(processedData);
        } catch (fetchError) {
          handleDataFetchError(fetchError);
        }
      } else {
        console.warn("Intervalo de datas incompleto");
        setItems([]);
      }
      
    } catch (err) {
      handleDataFetchError(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Processes data to ensure uniqueness and data integrity
   */
  const processDataForDisplay = (data: StockItem[]): StockItem[] => {
    // Check if data is using sample data
    setUsingSampleData(data.length > 0 && data[0].hasOwnProperty('isSampleData'));
    
    // Create a Map to store unique items by their ITEM_CODIGO
    const uniqueItemsMap = new Map<string, StockItem>();
    
    // Process the data to ensure we only have unique items
    data.forEach(item => {
      // Only add the item if it doesn't already exist in our map
      if (!uniqueItemsMap.has(item.ITEM_CODIGO)) {
        uniqueItemsMap.set(item.ITEM_CODIGO, item);
      } else {
        console.log(`Duplicate item found and skipped: ${item.ITEM_CODIGO}`);
      }
    });
    
    // Convert the Map values back to an array
    return Array.from(uniqueItemsMap.values());
  };

  /**
   * Updates state based on processed data
   */
  const updateStateWithData = (uniqueItems: StockItem[]) => {
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
  };

  /**
   * Handles errors in data fetching
   */
  const handleDataFetchError = (error: unknown) => {
    console.error("Erro ao carregar dados de estoque-vendas:", error);
    setError("Falha ao carregar dados de estoque-vendas");
    setItems([]);
    
    toast({
      title: "Erro",
      description: "Não foi possível carregar os dados do relatório. Verifique o console para mais detalhes.",
      variant: "destructive",
    });
  };

  /**
   * Updates date range and triggers data reload
   */
  const updateDateRange = (newDateRange: DateRange) => {
    console.log(`Atualizando intervalo de datas`, newDateRange);
    setDateRange(newDateRange);
  };

  /**
   * Manually refreshes data
   */
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
