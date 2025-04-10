
import { useState, useEffect } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { CalendarDays } from "lucide-react";
import { ContentCalendar } from "@/components/oni_agencia/content-schedule/ContentCalendar";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { ServiceCountBadges } from "@/components/oni_agencia/content-schedule/ServiceCountBadges";
import { useContentSchedules } from "@/hooks/useOniAgenciaContentSchedules";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";

const OniAgenciaControlePauta = () => {
  const currentDate = new Date();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);
  
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  
  // If there are clients and none is selected, select the first one
  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0].id);
    }
  }, [clients, selectedClient]);
  
  const { 
    data: schedules = [], 
    isLoading: isLoadingSchedules,
    refetch: refetchSchedules
  } = useContentSchedules(selectedClient, selectedYear, selectedMonth);
  
  // Log the current state to debug
  useEffect(() => {
    console.log("OniAgenciaControlePauta state:", {
      selectedClient,
      selectedMonth,
      selectedYear,
      selectedCollaborator,
      schedulesLoaded: schedules.length,
      schedules
    });
  }, [selectedClient, selectedMonth, selectedYear, selectedCollaborator, schedules]);
  
  // Refetch when month/year/client changes
  useEffect(() => {
    if (selectedClient) {
      console.log('Refetching schedules due to state change');
      refetchSchedules();
    }
  }, [selectedClient, selectedMonth, selectedYear, refetchSchedules]);
  
  const handleMonthYearChange = (month: number, year: number) => {
    console.log('Changing month/year to:', { month, year });
    setSelectedMonth(month);
    setSelectedYear(year);
  };
  
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-4 max-w-full">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Controle de Pauta</h1>
          <ServiceCountBadges events={schedules} />
        </div>
        
        <ContentScheduleFilters
          selectedClient={selectedClient}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedCollaborator={selectedCollaborator}
          onClientChange={setSelectedClient}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onCollaboratorChange={setSelectedCollaborator}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleFilters}
        />
        
        {selectedClient ? (
          <div className={`w-full overflow-x-auto ${isCollapsed ? 'h-[calc(100vh-150px)]' : 'h-[calc(100vh-250px)]'} transition-all duration-300`}>
            <ContentCalendar
              events={schedules}
              clientId={selectedClient}
              month={selectedMonth}
              year={selectedYear}
              onMonthChange={handleMonthYearChange}
              selectedCollaborator={selectedCollaborator}
            />
          </div>
        ) : (
          <div className="bg-white rounded-md border shadow-sm p-8 text-center">
            <p className="text-muted-foreground">
              Selecione um cliente para visualizar o calendário de conteúdo.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default OniAgenciaControlePauta;
