
import { useMemo, useState, useEffect, useCallback } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useInfiniteContentSchedules } from "@/hooks/oni_agencia/useInfiniteContentSchedules";
import { useServices } from "@/hooks/useOniAgenciaContentSchedules";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useContentFiltering(
  selectedClient: string, 
  selectedMonth: number, 
  selectedYear: number, 
  selectedCollaborator: string | null
) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [lastRefetchTime, setLastRefetchTime] = useState<number>(Date.now());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  // Filter events by selected services
  const filteredSchedules = useMemo(() => {
    if (selectedServiceIds.length === 0) {
      return []; // If no services selected, show nothing
    }
    
    if (selectedServiceIds.length === services.length) {
      return flattenedSchedules; // If all services selected, show everything
    }
    
    return flattenedSchedules.filter(event => 
      selectedServiceIds.includes(event.service_id)
    );
  }, [flattenedSchedules, selectedServiceIds, services.length]);
  
  const handleServicesChange = useCallback((serviceIds: string[]) => {
    setSelectedServiceIds(serviceIds);
    // Apply filtering immediately
    console.log("Services filter changed:", serviceIds);
  }, []);

  // Função para atualização manual - corrigida para sempre fazer refresh
  const handleManualRefetch = useCallback(async () => {
    console.log("Executando atualização manual dos dados");
    setLastRefetchTime(Date.now());
    setIsFullyLoaded(false); // Reset loading state on manual refresh
    
    // Invalidate all relevant queries first
    await queryClient.invalidateQueries({ 
      queryKey: ['content-schedules'],
      refetchType: 'all' 
    });
    
    await queryClient.invalidateQueries({ 
      queryKey: ['infinite-content-schedules'],
      refetchType: 'all'
    });
    
    // Then force a refetch
    return refetchSchedules().then(() => {
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
  }, [refetchSchedules, queryClient, toast]);
  
  // Função para força a atualização imediata após o drag-and-drop
  const forceImmediateRefresh = useCallback(async () => {
    console.log("Forçando atualização imediata após drag-and-drop");
    
    // Invalidate all relevant queries
    await queryClient.invalidateQueries({ 
      queryKey: ['content-schedules'],
      refetchType: 'all' 
    });
    
    await queryClient.invalidateQueries({ 
      queryKey: ['infinite-content-schedules'],
      refetchType: 'all'
    });
    
    // Force refetch
    return refetchSchedules();
  }, [queryClient, refetchSchedules]);

  // Show loading state until all data is loaded
  const showLoadingState = isLoadingSchedules || isFetchingNextPage || !isFullyLoaded;
  
  return {
    selectedServiceIds,
    filteredSchedules,
    isLoadingServices,
    isLoadingSchedules,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefetching,
    isFullyLoaded,
    showLoadingState,
    handleServicesChange,
    handleManualRefetch,
    forceImmediateRefresh
  };
}
