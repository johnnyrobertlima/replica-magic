
import { useState, useCallback, useEffect } from "react";
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
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear()); // Current year
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // UseCallback for better performance
  const handleClientChange = useCallback((clientId: string) => {
    console.log("Client changed to:", clientId);
    
    // Invalidate client scopes query when client changes
    if (clientId && clientId !== "") {
      queryClient.invalidateQueries({
        queryKey: ['clientScopes', clientId]
      });
    }
    
    setSelectedClient(clientId);
  }, [queryClient]);

  const handleCollaboratorChange = useCallback((collaboratorId: string | null) => {
    setSelectedCollaborator(collaboratorId);
  }, []);
  
  // Refetch when month/year/client change
  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const handleViewChange = useCallback((value: string) => {
    if (value === "calendar" || value === "list") {
      setViewMode(value);
    }
  }, []);
  
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
    handleManualRefetch
  } = useContentFiltering(
    selectedClient,
    selectedMonth,
    selectedYear,
    selectedCollaborator
  );
  
  // Polling for automatic periodic updates - but only when dialog is closed
  useEffect(() => {
    // Only set up polling if dialog is closed
    if (isDialogOpen) {
      console.log("Dialog is open, automatic polling disabled");
      return () => {}; // Return empty cleanup function
    }
    
    // Refetch data every 30 seconds when dialog is closed
    const intervalId = setInterval(() => {
      if (selectedClient) {
        console.log("Executando atualização automática periódica");
        handleManualRefetch();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [queryClient, selectedClient, handleManualRefetch, isDialogOpen]);
  
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
          onManualRefetch={isDialogOpen ? undefined : handleManualRefetch}
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
          onManualRefetch={isDialogOpen ? undefined : handleManualRefetch}
          onDialogStateChange={setIsDialogOpen}
        />
      </div>
    </main>
  );
};

export default OniAgenciaControlePauta;
