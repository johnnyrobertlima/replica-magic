
import { useState, useEffect } from "react";
import { 
  fetchBluebayItemsReport, 
  fetchItemDetails,
  ItemReport,
  ItemDetail 
} from "@/services/bluebay/reportsService";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";

// Define our DateRange interface to match useFinancial
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
      
      if (dateRange.startDate && dateRange.endDate) {
        const startDateFormatted = format(dateRange.startDate, 'yyyy-MM-dd');
        const endDateFormatted = format(dateRange.endDate, 'yyyy-MM-dd');
        
        console.log(`Carregando dados de relatório para o período: ${startDateFormatted} até ${endDateFormatted}`);
        console.log('Objeto dateRange:', dateRange);
        console.log('dateRange.startDate é Date?', dateRange.startDate instanceof Date);
        console.log('dateRange.endDate é Date?', dateRange.endDate instanceof Date);
        
        const data = await fetchBluebayItemsReport(startDateFormatted, endDateFormatted);
        console.log('Dados recebidos no hook:', data);
        console.log('Os dados são um array?', Array.isArray(data));
        console.log('Tamanho dos dados:', data.length);
        setItems(data);
      } else {
        console.warn("Date range is incomplete");
        setItems([]);
      }
      
    } catch (err) {
      console.error("Error loading reports data:", err);
      setError("Failed to load reports data");
      toast({
        title: "Error",
        description: "Failed to load reports data. Please try again later.",
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
    console.log(`Updating date range`, newDateRange);
    setDateRange(newDateRange);
  };

  const loadItemDetails = async (itemCode: string) => {
    try {
      setIsLoadingDetails(true);
      
      if (dateRange.startDate && dateRange.endDate) {
        const startDateFormatted = format(dateRange.startDate, 'yyyy-MM-dd');
        const endDateFormatted = format(dateRange.endDate, 'yyyy-MM-dd');
        
        console.log(`Loading details for item ${itemCode}`);
        const details = await fetchItemDetails(itemCode, startDateFormatted, endDateFormatted, 'BLUEBAY');
        setSelectedItemDetails(details);
      } else {
        console.warn("Date range is incomplete for item details");
        setSelectedItemDetails([]);
      }
      
    } catch (err) {
      console.error(`Error loading details for item ${itemCode}:`, err);
      toast({
        title: "Error",
        description: `Failed to load details for item ${itemCode}`,
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
