
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { CalendarDays, RefreshCw, List, LayoutGrid, Smartphone } from "lucide-react";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EditorialLinePopover } from "@/components/oni_agencia/content-schedule/EditorialLinePopover";
import { ProductsPopover } from "@/components/oni_agencia/content-schedule/ProductsPopover";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteContentSchedules } from "@/hooks/oni_agencia/useInfiniteContentSchedules";
import { CalendarEvent } from "@/types/oni-agencia";
import "@/components/oni_agencia/content-schedule/styles/CalendarLayout.css";

// Lazy load components for better initial loading
const ContentCalendar = lazy(() => import("@/components/oni_agencia/content-schedule/ContentCalendar").then(module => ({ default: module.ContentCalendar })));
const OptimizedContentScheduleList = lazy(() => import("@/components/oni_agencia/content-schedule/OptimizedContentScheduleList").then(module => ({ default: module.OptimizedContentScheduleList })));

// Fallback component for Suspense
const LoadingFallback = () => (
  <div className="w-full h-[calc(100vh-250px)] bg-white rounded-md border shadow-sm p-4">
    <Skeleton className="w-full h-full rounded-md" />
  </div>
);

const OniAgenciaControlePauta = () => {
  const currentDate = new Date();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  
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
    true, // Enable auto-fetching of all pages
    selectedServiceIds
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
  
  // Refetch when month/year/client changes
  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setIsFullyLoaded(false); // Reset loading state when date changes
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const handleManualRefetch = useCallback(() => {
    setIsFullyLoaded(false); // Reset loading state on manual refresh
    refetchSchedules();
  }, [refetchSchedules]);

  const handleViewChange = useCallback((value: string) => {
    if (value === "calendar" || value === "list") {
      setViewMode(value);
    }
  }, []);
  
  // Show loading state until all data is loaded
  const showLoadingState = isLoadingSchedules || isFetchingNextPage || !isFullyLoaded;
  
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-4 max-w-full">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Controle de Pauta</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              title="Visualização para dispositivos móveis"
            >
              <Link to="/client-area/oniagencia/controle-pauta/visualizacaoemcampo">
                <Smartphone className="h-4 w-4 mr-1" />
                <span className="sr-md:inline hidden">Ver em campo</span>
              </Link>
            </Button>
            <ToggleGroup type="single" value={viewMode} onValueChange={handleViewChange}>
              <ToggleGroupItem value="calendar" aria-label="Visualização em calendário" title="Visualização em calendário">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Visualização em lista" title="Visualização em lista">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <EditorialLinePopover events={flattenedSchedules} />
            <ProductsPopover events={flattenedSchedules} />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefetch}
              disabled={isRefetching || isLoadingSchedules}
              title="Atualizar agendamentos"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching || isFetchingNextPage ? 'animate-spin' : ''}`} />
              <span className="ml-2">Atualizar</span>
            </Button>
          </div>
        </div>
        
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
        
        <div className={`w-full overflow-x-auto ${isCollapsed ? 'h-[calc(100vh-150px)]' : 'h-[calc(100vh-250px)]'} transition-all duration-300`}>
          {showLoadingState ? (
            <LoadingFallback />
          ) : (
            <Suspense fallback={<LoadingFallback />}>
              {viewMode === "calendar" ? (
                <ContentCalendar
                  events={flattenedSchedules}
                  clientId={selectedClient || "all"} 
                  month={selectedMonth}
                  year={selectedYear}
                  onMonthChange={handleMonthYearChange}
                  selectedCollaborator={selectedCollaborator}
                />
              ) : (
                <OptimizedContentScheduleList
                  events={flattenedSchedules}
                  clientId={selectedClient || "all"}
                  selectedCollaborator={selectedCollaborator}
                  hasNextPage={!!hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  fetchNextPage={() => fetchNextPage()}
                />
              )}
            </Suspense>
          )}
        </div>
      </div>
    </main>
  );
};

export default OniAgenciaControlePauta;
