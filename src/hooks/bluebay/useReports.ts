
import { useState, useCallback, useEffect } from "react";
import { subDays } from "date-fns";
import { formatISO } from "date-fns";
import { getBluebayReportItems, getBluebayItemDetails } from "@/services/bluebay/reportsService";

export const useReports = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      // Formatar datas para requisição à API
      const startDateFormatted = dateRange.startDate 
        ? formatISO(dateRange.startDate, { representation: 'date' }) 
        : undefined;
      
      const endDateFormatted = dateRange.endDate
        ? formatISO(dateRange.endDate, { representation: 'date' })
        : undefined;

      console.info("Carregando dados de relatório para o período:", startDateFormatted, "até", endDateFormatted);
      
      const data = await getBluebayReportItems(startDateFormatted, endDateFormatted);
      setItems(data || []);
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  const loadItemDetails = useCallback(async (itemCode) => {
    setIsLoadingDetails(true);
    try {
      // Formatar datas para requisição à API
      const startDateFormatted = dateRange.startDate 
        ? formatISO(dateRange.startDate, { representation: 'date' }) 
        : undefined;
      
      const endDateFormatted = dateRange.endDate
        ? formatISO(dateRange.endDate, { representation: 'date' })
        : undefined;
      
      const details = await getBluebayItemDetails(
        itemCode, 
        startDateFormatted, 
        endDateFormatted
      );
      
      setSelectedItemDetails({
        itemCode,
        details
      });
    } catch (error) {
      console.error("Erro ao carregar detalhes do item:", error);
      setSelectedItemDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [dateRange]);

  const updateDateRange = useCallback((newDateRange) => {
    setDateRange(newDateRange);
  }, []);

  const refreshData = useCallback(() => {
    fetchItems();
    setSelectedItemDetails(null);
  }, [fetchItems]);

  // Carregamento inicial de dados
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    isLoading,
    items,
    refreshData,
    dateRange,
    updateDateRange,
    loadItemDetails,
    selectedItemDetails,
    isLoadingDetails
  };
};
