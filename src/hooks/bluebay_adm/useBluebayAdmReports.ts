
import { useState, useEffect } from "react";
import { 
  fetchBluebayItemsReport, 
  fetchItemDetails,
  ItemReport,
  ItemDetail 
} from "@/services/bluebay/reportsService";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";

// Define our DateRange interface to match other hooks
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export const useBluebayAdmReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<ItemReport[]>([]);
  const [selectedItemDetails, setSelectedItemDetails] = useState<ItemDetail[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 30), // Default to 30 days ago
    endDate: new Date() // Today
  });
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar se as datas estão definidas
      console.info("Objeto dateRange:", dateRange);
      console.info("dateRange.startDate é Date?", dateRange.startDate instanceof Date);
      console.info("dateRange.endDate é Date?", dateRange.endDate instanceof Date);
      
      if (dateRange.startDate && dateRange.endDate) {
        const startDateFormatted = format(dateRange.startDate, 'yyyy-MM-dd');
        const endDateFormatted = format(dateRange.endDate, 'yyyy-MM-dd');
        
        console.info(`Carregando dados de relatório para o período: ${startDateFormatted} até ${endDateFormatted}`);
        
        const data = await fetchBluebayItemsReport(startDateFormatted, endDateFormatted);
        setItems(data);
      } else {
        console.warn("Intervalo de datas incompleto");
        setItems([]);
      }
      
    } catch (err) {
      console.error("Error loading reports data:", err);
      setError("Failed to load reports data");
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange.startDate, dateRange.endDate]);

  const refreshData = () => {
    loadData();
  };

  const updateDateRange = (newDateRange: DateRange) => {
    console.log(`Atualizando intervalo de datas`, newDateRange);
    setDateRange(newDateRange);
  };

  const loadItemDetails = async (itemCode: string) => {
    try {
      setIsLoadingDetails(true);
      
      if (dateRange.startDate && dateRange.endDate) {
        const startDateFormatted = format(dateRange.startDate, 'yyyy-MM-dd');
        const endDateFormatted = format(dateRange.endDate, 'yyyy-MM-dd');
        
        console.log(`Carregando detalhes para o item ${itemCode}`);
        const details = await fetchItemDetails(itemCode, startDateFormatted, endDateFormatted);
        setSelectedItemDetails(details);
      } else {
        console.warn("Intervalo de datas incompleto para detalhes do item");
        setSelectedItemDetails([]);
      }
      
    } catch (err) {
      console.error(`Erro ao carregar detalhes do item ${itemCode}:`, err);
      toast({
        title: "Erro",
        description: `Falha ao carregar detalhes do item ${itemCode}`,
        variant: "destructive",
      });
      setSelectedItemDetails([]);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return {
    isLoading,
    items,
    error,
    refreshData,
    dateRange,
    updateDateRange,
    loadItemDetails,
    selectedItemDetails,
    isLoadingDetails
  };
};
