
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
import { queryClient } from "@/lib/queryClient";
import { supabase } from "@/integrations/supabase/client";
import { CalendarEvent } from "@/types/oni-agencia";

// Lazy load components para melhorar o carregamento inicial
const ContentCalendar = lazy(() => import("@/components/oni_agencia/content-schedule/ContentCalendar").then(module => ({ default: module.ContentCalendar })));
const OptimizedContentScheduleList = lazy(() => import("@/components/oni_agencia/content-schedule/OptimizedContentScheduleList").then(module => ({ default: module.OptimizedContentScheduleList })));

// Componente de fallback para Suspense
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
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);
  
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  
  // UseCallback para melhorar a performance
  const handleClientChange = useCallback((clientId: string) => {
    setSelectedClient(clientId);
  }, []);

  const handleCollaboratorChange = useCallback((collaboratorId: string | null) => {
    setSelectedCollaborator(collaboratorId);
  }, []);
  
  // Usar o novo hook useInfiniteContentSchedules com useInfiniteQuery
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
    selectedCollaborator
  );
  
  // Aplainar os dados paginados para uso nos componentes
  const flattenedSchedules = useMemo(() => {
    if (!infiniteSchedules?.pages) return [] as CalendarEvent[];
    return infiniteSchedules.pages.flatMap(page => page.data) as CalendarEvent[];
  }, [infiniteSchedules]);
  
  // Prefetch da próxima página quando necessário
  useEffect(() => {
    if (hasNextPage && !isLoadingSchedules && !isFetchingNextPage && infiniteSchedules?.pages) {
      const currentPageParam = infiniteSchedules?.pageParams[infiniteSchedules.pageParams.length - 1];
      const nextPageParam = typeof currentPageParam === 'number' ? currentPageParam + 1 : 1;
      
      queryClient.prefetchInfiniteQuery({
        queryKey: ['infiniteContentSchedules', selectedClient || null, selectedYear, selectedMonth, selectedCollaborator],
        queryFn: ({ pageParam = nextPageParam }) => {
          return supabase
            .rpc('get_paginated_schedules', {
              p_client_id: selectedClient || null,
              p_year: selectedYear,
              p_month: selectedMonth,
              p_collaborator_id: selectedCollaborator,
              p_limit: 50,
              p_offset: pageParam * 50
            })
            .then(result => {
              const { data, error } = result;
              if (error) throw error;
              return {
                data: (Array.isArray(data) ? data : []) as CalendarEvent[],
                nextPage: (Array.isArray(data) && data.length >= 50) ? pageParam + 1 : undefined,
                totalCount: Array.isArray(data) ? data.length : 0
              };
            });
        },
        initialPageParam: nextPageParam,
      });
    }
  }, [infiniteSchedules, hasNextPage, isLoadingSchedules, isFetchingNextPage, selectedClient, selectedYear, selectedMonth, selectedCollaborator]);
  
  // Refetch quando mês/ano/cliente muda
  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const handleManualRefetch = useCallback(() => {
    refetchSchedules();
  }, [refetchSchedules]);

  const handleViewChange = useCallback((value: string) => {
    if (value === "calendar" || value === "list") {
      setViewMode(value);
    }
  }, []);
  
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
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <span className="ml-2">Atualizar</span>
            </Button>
          </div>
        </div>
        
        <ContentScheduleFilters
          selectedClient={selectedClient}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedCollaborator={selectedCollaborator}
          onClientChange={handleClientChange}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onCollaboratorChange={handleCollaboratorChange}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleFilters}
        />
        
        <div className={`w-full overflow-x-auto ${isCollapsed ? 'h-[calc(100vh-150px)]' : 'h-[calc(100vh-250px)]'} transition-all duration-300`}>
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
        </div>
      </div>
    </main>
  );
};

export default OniAgenciaControlePauta;
