
import { useState, useCallback, useEffect } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { useQueryClient } from "@tanstack/react-query";
import { CapturasHeader } from "@/components/oni_agencia/content-schedule/capturas/CapturasHeader";
import { CapturasContent } from "@/components/oni_agencia/content-schedule/capturas/CapturasContent";
import { useCapturasFiltering } from "@/hooks/oni_agencia/useCapturasFiltering";
import { useToast } from "@/hooks/use-toast";

const OniAgenciaCapturas = () => {
  const currentDate = new Date();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
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
  
  // Use the custom hook for content filtering and loading with capture date filter
  const {
    selectedServiceIds,
    filteredCaptureSchedules,
    isLoadingSchedules,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isRefetching,
    showLoadingState,
    handleServicesChange,
    handleManualRefetch
  } = useCapturasFiltering(
    selectedClient,
    selectedMonth,
    selectedYear,
    selectedCollaborator
  );
  
  // Polling for automatic periodic updates
  useEffect(() => {
    // Refetch data every 30 seconds when dialog is closed
    const intervalId = setInterval(() => {
      if (selectedClient && !isDialogOpen) {
        console.log("Executando atualização automática periódica para capturas");
        handleManualRefetch();
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [queryClient, selectedClient, handleManualRefetch, isDialogOpen]);
  
  // Alertar o usuário quando não há cliente selecionado
  useEffect(() => {
    if (!selectedClient && !isLoadingSchedules && !isRefetching) {
      toast({
        title: "Cliente não selecionado",
        description: "Selecione um cliente para criar agendamentos de captura.",
        variant: "default",
        duration: 5000,
      });
    }
  }, [selectedClient, isLoadingSchedules, isRefetching, toast]);
  
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-4 max-w-full">
        <CapturasHeader 
          filteredSchedules={filteredCaptureSchedules}
          viewMode={viewMode}
          onViewChange={handleViewChange}
          isRefetching={isRefetching}
          isLoadingSchedules={isLoadingSchedules}
          isFetchingNextPage={isFetchingNextPage}
          onManualRefetch={handleManualRefetch}
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
        
        <CapturasContent
          viewMode={viewMode}
          filteredSchedules={filteredCaptureSchedules}
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
          onManualRefetch={handleManualRefetch}
          onDialogStateChange={setIsDialogOpen}
        />
      </div>
    </main>
  );
};

export default OniAgenciaCapturas;
