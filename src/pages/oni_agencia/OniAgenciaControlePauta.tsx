
import { useState, useEffect } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { CalendarDays } from "lucide-react";
import { ContentCalendar } from "@/components/oni_agencia/content-schedule/ContentCalendar";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { useContentSchedules } from "@/hooks/useOniAgenciaContentSchedules";
import { useClients } from "@/hooks/useOniAgenciaClients";

const OniAgenciaControlePauta = () => {
  const currentDate = new Date();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  
  // If there are clients and none is selected, select the first one
  useEffect(() => {
    if (clients.length > 0 && !selectedClient) {
      setSelectedClient(clients[0].id);
    }
  }, [clients, selectedClient]);
  
  const { 
    data: schedules = [], 
    isLoading: isLoadingSchedules 
  } = useContentSchedules(selectedClient, selectedYear, selectedMonth);
  
  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };
  
  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Controle de Pauta</h1>
        </div>
        
        <ContentScheduleFilters
          selectedClient={selectedClient}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onClientChange={setSelectedClient}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
        
        {selectedClient ? (
          <ContentCalendar
            events={schedules}
            clientId={selectedClient}
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={handleMonthYearChange}
          />
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
