
import { useState, useEffect, useCallback } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { CalendarDays, RefreshCw, List, LayoutGrid } from "lucide-react";
import { ContentCalendar } from "@/components/oni_agencia/content-schedule/ContentCalendar";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { ContentScheduleList } from "@/components/oni_agencia/content-schedule/ContentScheduleList";
import { useContentSchedules, useAllContentSchedules } from "@/hooks/useOniAgenciaContentSchedules";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EditorialLinePopover } from "@/components/oni_agencia/content-schedule/EditorialLinePopover";
import { ProductsPopover } from "@/components/oni_agencia/content-schedule/ProductsPopover";

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
  
  // Use either useContentSchedules or useAllContentSchedules based on selectedClient
  const { 
    data: filteredSchedules = [], 
    isLoading: isLoadingSchedules,
    refetch: refetchSchedules,
    isRefetching
  } = selectedClient 
    ? useContentSchedules(selectedClient, selectedYear, selectedMonth)
    : useAllContentSchedules(selectedYear, selectedMonth); // Updated to pass year and month parameters
  
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
            <ToggleGroup type="single" value={viewMode} onValueChange={handleViewChange}>
              <ToggleGroupItem value="calendar" aria-label="Visualização em calendário" title="Visualização em calendário">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Visualização em lista" title="Visualização em lista">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <EditorialLinePopover events={filteredSchedules} />
            <ProductsPopover events={filteredSchedules} />
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
          {viewMode === "calendar" ? (
            <ContentCalendar
              events={filteredSchedules}
              clientId={selectedClient || "all"} // Pass "all" when no client is selected
              month={selectedMonth}
              year={selectedYear}
              onMonthChange={handleMonthYearChange}
              selectedCollaborator={selectedCollaborator}
            />
          ) : (
            <ContentScheduleList
              events={filteredSchedules}
              clientId={selectedClient || "all"} // Pass "all" when no client is selected
              selectedCollaborator={selectedCollaborator}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default OniAgenciaControlePauta;
