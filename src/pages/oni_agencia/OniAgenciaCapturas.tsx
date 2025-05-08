
import { useState, useCallback, useEffect } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { useContentFiltering } from "@/hooks/oni_agencia/useContentFiltering";
import { useQueryClient } from "@tanstack/react-query";
import { ContentScheduleList } from "@/components/oni_agencia/content-schedule/ContentScheduleList";
import { ContentCalendar } from "@/components/oni_agencia/content-schedule/ContentCalendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ListIcon, RefreshCcw } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Header component for the captures page
function CapturasHeader({ 
  viewMode, 
  onViewChange, 
  isRefetching, 
  isLoadingSchedules,
  isFetchingNextPage,
  onManualRefetch 
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
      <h1 className="text-2xl font-bold">Agenda de Capturas</h1>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onManualRefetch}
          disabled={isRefetching}
          className="mr-2"
        >
          <RefreshCcw size={16} className={`mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
          {isRefetching ? 'Atualizando...' : 'Atualizar'}
        </Button>
        
        <Tabs 
          defaultValue={viewMode} 
          value={viewMode}
          onValueChange={onViewChange} 
          className="flex-shrink-0"
        >
          <TabsList>
            <TabsTrigger value="calendar">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="list">
              <ListIcon className="h-4 w-4 mr-2" />
              Lista
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

// Main content area component
function ContentArea({ 
  viewMode, 
  filteredSchedules, 
  clientId,
  month,
  year,
  selectedCollaborator,
  onMonthYearChange,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  showLoadingState,
  isCollapsed,
  onManualRefetch
}) {
  // Filter schedules to only show ones with capture_date
  const captureSchedules = filteredSchedules.filter(schedule => 
    schedule.capture_date !== null && schedule.capture_date !== undefined
  );
  
  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'mt-4' : 'mt-8'}`}>
      {showLoadingState ? (
        <div className="space-y-4">
          <Skeleton className="h-[600px] w-full rounded-md" />
        </div>
      ) : viewMode === 'calendar' ? (
        <ContentCalendar
          events={captureSchedules}
          clientId={clientId}
          month={month}
          year={year}
          onMonthYearChange={onMonthYearChange}
          onManualRefetch={onManualRefetch}
        />
      ) : (
        <ContentScheduleList
          events={captureSchedules}
          clientId={clientId}
          selectedCollaborator={selectedCollaborator}
          onManualRefetch={onManualRefetch}
        />
      )}
    </div>
  );
}

// Main page component for the captures view
const OniAgenciaCapturas = () => {
  const currentDate = new Date();
  const queryClient = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // Current month
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear()); // Current year
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);
  
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
  
  // Polling for automatic periodic updates
  useEffect(() => {
    // Refetch data every 30 seconds
    const intervalId = setInterval(() => {
      if (selectedClient) {
        console.log("Executando atualização automática periódica");
        handleManualRefetch();
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [queryClient, selectedClient, handleManualRefetch]);
  
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-4 max-w-full">
        <CapturasHeader 
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
          onManualRefetch={handleManualRefetch}
        />
      </div>
    </main>
  );
};

export default OniAgenciaCapturas;
