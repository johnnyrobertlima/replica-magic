
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { CalendarDays, RefreshCw } from "lucide-react";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteContentSchedules } from "@/hooks/oni_agencia/useInfiniteContentSchedules";
import { CalendarEvent } from "@/types/oni-agencia";

// Lazy loading for mobile list component
const MobileContentScheduleList = lazy(() => 
  import('@/components/oni_agencia/content-schedule/mobile/MobileContentScheduleList').then(module => ({ 
    default: module.MobileContentScheduleList 
  }))
);

// Loading fallback component
const LoadingFallback = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 w-full h-[calc(100vh-200px)]">
    <Skeleton className="w-full h-full rounded-md" />
  </div>
);

const VisualizacaoEmCampo = () => {
  const { toast } = useToast();
  const currentDate = new Date();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(true); // Start with collapsed filters
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  
  // Optimized clients query
  const { data: clients = [] } = useClients();
  
  // UseCallback for better performance
  const handleClientChange = useCallback((clientId: string) => {
    setSelectedClient(clientId);
    setIsFullyLoaded(false); // Reset loading state when client changes
  }, []);

  const handleCollaboratorChange = useCallback((collaboratorId: string | null) => {
    setSelectedCollaborator(collaboratorId);
    setIsFullyLoaded(false); // Reset loading state when collaborator changes
  }, []);

  const handleServicesChange = useCallback((serviceIds: string[]) => {
    setSelectedServiceIds(serviceIds);
    setIsFullyLoaded(false); // Reset loading state when services change
  }, []);
  
  // Enhanced hook with auto-fetching enabled
  const { 
    data: infiniteSchedules,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching
  } = useInfiniteContentSchedules(
    selectedClient || null, 
    selectedYear, 
    selectedMonth,
    selectedCollaborator,
    true, // Enable auto-fetching of all pages
    selectedServiceIds
  );
  
  // Monitor loading state to know when all data is fully loaded
  useEffect(() => {
    if (infiniteSchedules?.pages && !hasNextPage && !isFetchingNextPage && !isLoading) {
      setIsFullyLoaded(true);
      console.log("Mobile view: All content schedules for the month fully loaded!");
    } else {
      setIsFullyLoaded(false);
    }
  }, [infiniteSchedules, hasNextPage, isFetchingNextPage, isLoading]);
  
  // Flatten the paginated data
  const flattenedSchedules = useMemo(() => {
    if (!infiniteSchedules?.pages) return [] as CalendarEvent[];
    return infiniteSchedules.pages.flatMap(page => page.data) as CalendarEvent[];
  }, [infiniteSchedules]);

  // Refetch when month/year/client changes
  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setIsFullyLoaded(false); // Reset loading state when date changes
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const handleManualRefetch = useCallback(() => {
    setIsFullyLoaded(false); // Reset loading state on manual refresh
    toast({
      title: "Atualizando dados",
      description: "Buscando os agendamentos mais recentes...",
      duration: 3000,
    });
    refetch();
  }, [refetch, toast]);

  // Show loading state until all data is loaded
  const showLoadingState = isLoading || isFetchingNextPage || !isFullyLoaded;
  
  return (
    <main className="container-fluid p-0 max-w-full bg-gray-50 min-h-screen">
      <OniAgenciaMenu />
      <div className="container mx-auto px-2 py-3 max-w-full">
        <div className="flex items-center gap-2 mb-4 bg-white p-4 rounded-lg shadow-sm">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight">Visualização em Campo</h1>
          <div className="ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefetch}
              disabled={isRefetching || isLoading}
              title="Atualizar agendamentos"
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching || isFetchingNextPage ? 'animate-spin' : ''} mr-1`} />
              <span className="sr-md:inline hidden">Atualizar</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm mb-4">
          <ContentScheduleFilters
            selectedClient={selectedClient}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            selectedCollaborator={selectedCollaborator}
            selectedServiceIds={selectedServiceIds}
            onClientChange={handleClientChange}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onCollaboratorChange={handleCollaboratorChange}
            onServicesChange={handleServicesChange}
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleFilters}
          />
        </div>
        
        <div className={`w-full overflow-x-auto bg-gray-50 rounded-lg transition-all duration-300 ${isCollapsed ? 'h-[calc(100vh-180px)]' : 'h-[calc(100vh-280px)]'}`}>
          {showLoadingState ? (
            <LoadingFallback />
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              <MobileContentScheduleList
                events={flattenedSchedules}
                clientId={selectedClient || "all"}
                selectedCollaborator={selectedCollaborator}
                isLoading={false} // We're handling loading state at this level now
                hasMore={false} // Auto-fetching will handle this so no manual loading needed
                onLoadMore={() => {}} // No need for manual load more now
                isLoadingMore={false}
              />
            </Suspense>
          )}
        </div>
      </div>
    </main>
  );
};

export default VisualizacaoEmCampo;
