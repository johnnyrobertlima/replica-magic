
import { useMemo, useState, useEffect, useCallback } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useInfiniteContentSchedules } from "@/hooks/oni_agencia/useInfiniteContentSchedules";
import { useServices } from "@/hooks/useOniAgenciaContentSchedules";
import { useToast } from "@/hooks/use-toast";

export function useCapturasFiltering(
  selectedClient: string, 
  selectedMonth: number, 
  selectedYear: number, 
  selectedCollaborator: string | null
) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [lastRefetchTime, setLastRefetchTime] = useState<number>(Date.now());
  const { toast } = useToast();
  
  // Get services
  const { data: services = [], isLoading: isLoadingServices } = useServices();
  
  // Initialize selected services with all services when they load
  useEffect(() => {
    if (services.length > 0 && selectedServiceIds.length === 0) {
      setSelectedServiceIds(services.map(service => service.id));
    }
  }, [services, selectedServiceIds.length]);
  
  // Use the enhanced infinite query hook with auto-fetching enabled
  const { 
    data: infiniteSchedules,
    isLoading: isLoadingSchedules,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch: refetchSchedules,
    isRefetching
  } = useInfiniteContentSchedules(
    selectedClient || null, 
    selectedYear, 
    selectedMonth,
    selectedCollaborator,
    true // Enable auto-fetching of all pages
  );
  
  // Monitor loading state to know when all data is fully loaded
  useEffect(() => {
    // Set isFullyLoaded to true when:
    // 1. We have data AND
    // 2. Either there's no more pages OR we're not fetching next page
    if (infiniteSchedules?.pages && !hasNextPage && !isFetchingNextPage && !isLoadingSchedules) {
      setIsFullyLoaded(true);
      console.log("All content schedules for the month fully loaded!");
    } else {
      setIsFullyLoaded(false);
    }
  }, [infiniteSchedules, hasNextPage, isFetchingNextPage, isLoadingSchedules]);
  
  // Flatten the paginated data for use in components
  const flattenedSchedules = useMemo(() => {
    if (!infiniteSchedules?.pages) return [] as CalendarEvent[];
    return infiniteSchedules.pages.flatMap(page => page.data) as CalendarEvent[];
  }, [infiniteSchedules]);
  
  // Filter events by selected services and capture_date (REMOVED status filter)
  const filteredCaptureSchedules = useMemo(() => {
    if (selectedServiceIds.length === 0) {
      return []; // If no services selected, show nothing
    }
    
    // Primeiro filtramos por serviço
    const serviceFiltered = selectedServiceIds.length === services.length
      ? flattenedSchedules // Se todos os serviços selecionados, não filtrar
      : flattenedSchedules.filter(event => selectedServiceIds.includes(event.service_id));
    
    // Agora garantimos que apenas eventos com data de captura sejam retornados
    // REMOVIDO filtro de status "Liberado para Captura"
    const finalFiltered = serviceFiltered.filter(event => {
      const hasCaptureDate = !!event.capture_date;
      
      return hasCaptureDate;
    });
    
    // Log para diagnóstico
    console.log(`useCapturasFiltering - Found ${finalFiltered.length} events with capture date`);
    
    return finalFiltered;
  }, [flattenedSchedules, selectedServiceIds, services.length]);
  
  const handleServicesChange = useCallback((serviceIds: string[]) => {
    setSelectedServiceIds(serviceIds);
    // Apply filtering immediately
    console.log("Services filter changed:", serviceIds);
  }, []);

  // Função para atualização manual com debounce para evitar múltiplas chamadas
  const handleManualRefetch = useCallback(() => {
    const now = Date.now();
    // Evita múltiplas atualizações em um curto período de tempo (limite de 2 segundos)
    if (now - lastRefetchTime < 2000) {
      console.log("Ignorando atualização manual (muito próxima da última atualização)");
      return;
    }
    
    setLastRefetchTime(now);
    setIsFullyLoaded(false); // Reset loading state on manual refresh
    console.log("Executando atualização manual dos dados");
    
    refetchSchedules().then(() => {
      toast({
        title: "Dados atualizados",
        description: "Os agendamentos foram atualizados com sucesso.",
      });
    }).catch(error => {
      console.error("Erro ao atualizar os dados:", error);
      toast({
        variant: "destructive",
        title: "Erro na atualização",
        description: "Não foi possível atualizar os agendamentos.",
      });
    });
  }, [refetchSchedules, lastRefetchTime, toast]);

  // Show loading state until all data is loaded
  const showLoadingState = isLoadingSchedules || isFetchingNextPage || !isFullyLoaded;
  
  return {
    selectedServiceIds,
    filteredCaptureSchedules,
    isLoadingServices,
    isLoadingSchedules,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefetching,
    isFullyLoaded,
    showLoadingState,
    handleServicesChange,
    handleManualRefetch
  };
}
