
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
    if (infiniteSchedules?.pages && !hasNextPage && !isFetchingNextPage && !isLoadingSchedules) {
      setIsFullyLoaded(true);
      console.log("All content schedules for the month fully loaded in capturas!");
    } else {
      setIsFullyLoaded(false);
    }
  }, [infiniteSchedules, hasNextPage, isFetchingNextPage, isLoadingSchedules]);
  
  // Flatten the paginated data for use in components
  const flattenedSchedules = useMemo(() => {
    if (!infiniteSchedules?.pages) return [] as CalendarEvent[];
    return infiniteSchedules.pages.flatMap(page => page.data) as CalendarEvent[];
  }, [infiniteSchedules]);
  
  // Filter events by capture_date AND selected services
  const filteredCaptureSchedules = useMemo(() => {
    if (selectedServiceIds.length === 0) {
      return []; // If no services selected, show nothing
    }
    
    // First filter by service IDs
    const serviceFiltered = selectedServiceIds.length === services.length
      ? flattenedSchedules // If all services selected, no service filtering needed
      : flattenedSchedules.filter(event => selectedServiceIds.includes(event.service_id));
    
    // Then filter to only include events with capture_date
    return serviceFiltered.filter(event => event.capture_date !== null);
  }, [flattenedSchedules, selectedServiceIds, services.length]);
  
  const handleServicesChange = useCallback((serviceIds: string[]) => {
    setSelectedServiceIds(serviceIds);
    console.log("Services filter changed in capturas:", serviceIds);
  }, []);

  // Função para atualização manual com debounce
  const handleManualRefetch = useCallback(() => {
    const now = Date.now();
    if (now - lastRefetchTime < 2000) {
      console.log("Ignorando atualização manual (muito próxima da última atualização)");
      return;
    }
    
    setLastRefetchTime(now);
    setIsFullyLoaded(false);
    console.log("Executando atualização manual dos dados de captura");
    
    refetchSchedules().then(() => {
      toast({
        title: "Dados atualizados",
        description: "Os agendamentos de captura foram atualizados com sucesso.",
      });
    }).catch(error => {
      console.error("Erro ao atualizar os dados:", error);
      toast({
        variant: "destructive",
        title: "Erro na atualização",
        description: "Não foi possível atualizar os agendamentos de captura.",
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
