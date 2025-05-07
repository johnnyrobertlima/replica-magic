
import { useState, useCallback, useEffect, useRef } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { ControlPautaHeader } from "@/components/oni_agencia/content-schedule/control-pauta/ControlPautaHeader";
import { ContentArea } from "@/components/oni_agencia/content-schedule/control-pauta/ContentArea";
import { useContentFiltering } from "@/hooks/oni_agencia/useContentFiltering";
import { useQueryClient } from "@tanstack/react-query";

const OniAgenciaControlePauta = () => {
  const currentDate = new Date();
  const queryClient = useQueryClient();
  const updateCounterRef = useRef<number>(0);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);
  
  // UseCallback para better performance
  const handleClientChange = useCallback((clientId: string) => {
    setSelectedClient(clientId);
  }, []);

  const handleCollaboratorChange = useCallback((collaboratorId: string | null) => {
    setSelectedCollaborator(collaboratorId);
  }, []);
  
  // Refetch quando mês/ano/cliente mudarem
  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const handleViewChange = useCallback((value: string) => {
    if (value === "calendar" || value === "list") {
      setViewMode(value);
    }
  }, []);
  
  // Enhanced manual refresh - agora sem throttling
  const handleManualRefetch = useCallback(async () => {
    updateCounterRef.current += 1;
    lastUpdateTimeRef.current = Date.now();
    
    console.log("Executando atualização manual completa sem throttling");
    
    // Invalidate all relevant queries and wait for completion
    await queryClient.invalidateQueries({ 
      queryKey: ['content-schedules'],
      refetchType: 'all' 
    });
    
    await queryClient.invalidateQueries({ 
      queryKey: ['infinite-content-schedules'],
      refetchType: 'all'
    });
    
    // Force UI re-render
    setRefreshKey(prev => prev + 1);
  }, [queryClient]);
  
  // Use the custom hook for content filtering and loading
  const {
    selectedServiceIds,
    filteredSchedules,
    isLoadingSchedules,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefetching,
    showLoadingState,
    handleServicesChange,
    handleManualRefetch: hookRefetch,
    forceImmediateRefresh
  } = useContentFiltering(
    selectedClient,
    selectedMonth,
    selectedYear,
    selectedCollaborator
  );
  
  // Force refresh when key changes to ensure render after operations
  useEffect(() => {
    if (refreshKey > 0) {
      console.log(`Renderização forçada do controle de pauta (${refreshKey})`);
      // Forçar refetch através do hook quando a key mudar
      hookRefetch();
    }
  }, [refreshKey, hookRefetch]);
  
  // Polling para atualização automática periodicamente
  useEffect(() => {
    // Refetch data every 30 seconds
    const intervalId = setInterval(() => {
      if (selectedClient) {
        console.log("Executando atualização automática periódica");
        hookRefetch();
      }
    }, 30000); // 30 segundos
    
    return () => clearInterval(intervalId);
  }, [selectedClient, hookRefetch]);
  
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-4 max-w-full">
        <ControlPautaHeader 
          filteredSchedules={filteredSchedules}
          viewMode={viewMode}
          onViewChange={handleViewChange}
          isRefetching={isRefetching}
          isLoadingSchedules={isLoadingSchedules}
          isFetchingNextPage={isFetchingNextPage}
          onManualRefetch={hookRefetch}
        />
        
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
        
        <ContentArea 
          key={`content-area-${refreshKey}`}
          viewMode={viewMode}
          filteredSchedules={filteredSchedules}
          clientId={selectedClient}
          month={selectedMonth}
          year={selectedYear}
          selectedCollaborator={selectedCollaborator}
          onMonthYearChange={handleMonthYearChange}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          showLoadingState={showLoadingState}
          isCollapsed={isCollapsed}
          onManualRefetch={hookRefetch}
          forceImmediateRefresh={forceImmediateRefresh}
        />
      </div>
    </main>
  );
};

export default OniAgenciaControlePauta;
