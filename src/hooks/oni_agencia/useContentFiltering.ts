
import { useMemo, useState, useEffect, useCallback } from "react";
import { CalendarEvent } from "@/types/oni-agencia";
import { useInfiniteContentSchedules } from "@/hooks/oni_agencia/useInfiniteContentSchedules";
import { useServices } from "@/hooks/useOniAgenciaContentSchedules";

export function useContentFiltering(
  selectedClient: string, 
  selectedMonth: number, 
  selectedYear: number, 
  selectedCollaborator: string | null
) {
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  
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

  const handleManualRefetch = useCallback(() => {
    setIsFullyLoaded(false); // Reset loading state on manual refresh
    refetchSchedules();
  }, [refetchSchedules]);

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
    handleManualRefetch
  };
}
