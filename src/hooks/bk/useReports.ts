
import { useState, useEffect } from "react";
import { 
  fetchBkItemsReport, 
  fetchItemDetails,
  ItemReport,
  ItemDetail 
} from "@/services/bk/reportsService";
import { useToast } from "@/hooks/use-toast";

// Helper to get date from X days ago in ISO format
const getDateXDaysAgo = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

export const useReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<ItemReport[]>([]);
  const [selectedItemDetails, setSelectedItemDetails] = useState<ItemDetail[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: getDateXDaysAgo(30), // Default to 30 days ago
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Loading reports data for date range: ${dateRange.startDate} to ${dateRange.endDate}`);
      
      const data = await fetchBkItemsReport(dateRange.startDate, dateRange.endDate);
      setItems(data);
      
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

  const updateDateRange = (startDate: string, endDate: string) => {
    console.log(`Updating date range to: ${startDate} - ${endDate}`);
    setDateRange({ startDate, endDate });
  };

  const loadItemDetails = async (itemCode: string) => {
    try {
      setIsLoadingDetails(true);
      
      console.log(`Loading details for item ${itemCode}`);
      const details = await fetchItemDetails(itemCode, dateRange.startDate, dateRange.endDate);
      setSelectedItemDetails(details);
      
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
