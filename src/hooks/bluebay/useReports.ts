
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
      
      // Adicionar um console.log para verificar a estrutura da dateRange
      console.log("Objeto dateRange:", dateRange);
      console.log("dateRange.startDate é Date?", dateRange.startDate instanceof Date);
      console.log("dateRange.endDate é Date?", dateRange.endDate instanceof Date);
      
      const data = await getBluebayReportItems(startDateFormatted, endDateFormatted);
      console.log("Dados recebidos no hook:", data);
      
      // Verificar se os dados são o que esperamos
      console.log("Os dados são um array?", Array.isArray(data));
      console.log("Tamanho dos dados:", Array.isArray(data) ? data.length : 'N/A');
      
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
      
      console.log(`Carregando detalhes para o item ${itemCode} no período:`, 
        startDateFormatted, "até", endDateFormatted);
      
      const details = await getBluebayItemDetails(
        itemCode, 
        startDateFormatted, 
        endDateFormatted
      );
      
      console.log(`Detalhes recebidos para o item ${itemCode}:`, details);
      
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
    console.log("Atualizando dateRange para:", newDateRange);
    setDateRange(newDateRange);
  }, []);

  const refreshData = useCallback(() => {
    console.log("Atualizando dados...");
    fetchItems();
    setSelectedItemDetails(null);
  }, [fetchItems]);

  // Carregamento inicial de dados
  useEffect(() => {
    console.log("Executando useEffect para buscar itens iniciais");
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
