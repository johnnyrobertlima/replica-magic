
import { useState, useEffect, useCallback } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { CalendarDays, RefreshCw } from "lucide-react";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { useAllContentSchedules, useContentSchedules } from "@/hooks/useOniAgenciaContentSchedules";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { Button } from "@/components/ui/button";
import { MobileContentScheduleList } from "@/components/oni_agencia/content-schedule/mobile/MobileContentScheduleList";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useToast } from "@/hooks/use-toast";

const VisualizacaoEmCampo = () => {
  const { toast } = useToast();
  const currentDate = new Date();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);
  
  const { data: clients = [] } = useClients();
  
  // UseCallback para melhorar a performance
  const handleClientChange = useCallback((clientId: string) => {
    setSelectedClient(clientId);
  }, []);

  const handleCollaboratorChange = useCallback((collaboratorId: string | null) => {
    setSelectedCollaborator(collaboratorId);
  }, []);
  
  // Usamos useAllContentSchedules para obter todos os agendamentos
  const { 
    data: filteredSchedules = [], 
    isLoading: isLoadingSchedules,
    refetch: refetchSchedules,
    isRefetching
  } = selectedClient 
    ? useContentSchedules(selectedClient, selectedYear, selectedMonth)
    : useAllContentSchedules(selectedYear, selectedMonth);
  
  // Refetch quando mês/ano/cliente muda
  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  const handleManualRefetch = useCallback(() => {
    toast({
      title: "Atualizando dados",
      description: "Buscando os agendamentos mais recentes...",
      duration: 3000,
    });
    refetchSchedules();
  }, [refetchSchedules, toast]);
  
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto px-2 py-3 max-w-full">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold tracking-tight">Visualização em Campo</h1>
          <div className="ml-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefetch}
              disabled={isRefetching || isLoadingSchedules}
              title="Atualizar agendamentos"
              className="flex items-center"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''} mr-1`} />
              <span className="sr-md:inline hidden">Atualizar</span>
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
        
        <div className={`w-full overflow-x-auto ${isCollapsed ? 'h-[calc(100vh-120px)]' : 'h-[calc(100vh-220px)]'} transition-all duration-300`}>
          <MobileContentScheduleList
            events={filteredSchedules}
            clientId={selectedClient || "all"}
            selectedCollaborator={selectedCollaborator}
            isLoading={isLoadingSchedules || isRefetching}
          />
        </div>
      </div>
    </main>
  );
};

export default VisualizacaoEmCampo;
