
import { useState, useCallback, useEffect } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { ContentCalendar } from "@/components/oni_agencia/content-schedule/ContentCalendar";
import { CalendarEvent } from "@/types/oni-agencia";
import { useContentSchedules } from "@/hooks/useOniAgenciaContentSchedules";
import { Select } from "@/components/ui/select"
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const FeirinhaDaConcordiaAgenda = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>("");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  // Fetch events for the selected month and year
  const { data: fetchedEvents, isLoading } = useContentSchedules(
    "feirinha_da_concordia",
    selectedYear,
    selectedMonth
  );
  
  // Update events when fetchedEvents changes
  useEffect(() => {
    if (fetchedEvents) {
      setEvents(fetchedEvents);
    }
  }, [fetchedEvents]);
  
  // Filter events based on selected collaborator
  const filteredEvents = selectedCollaborator
    ? events.filter(event => event.collaborator_id === selectedCollaborator)
    : events;
  
  // Handle month and year change
  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);

  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-4 max-w-full">
        <h1 className="text-2xl font-bold mb-4">
          Agenda da Feirinha da Concórdia
        </h1>
        
        <div className="mb-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="month" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              Mês
            </label>
            <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={String(month)}>
                    {new Date(selectedYear, month - 1, 1).toLocaleString('default', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <label htmlFor="year" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              Ano
            </label>
            <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <label htmlFor="collaborator" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              Colaborador
            </label>
            <Select value={selectedCollaborator} onValueChange={setSelectedCollaborator}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecione o colaborador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="colaborador1">Colaborador 1</SelectItem>
                <SelectItem value="colaborador2">Colaborador 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <ContentCalendar
          events={filteredEvents}
          clientId="feirinha_da_concordia"
          month={selectedMonth}
          year={selectedYear}
          onMonthYearChange={handleMonthYearChange}
          selectedCollaborator={selectedCollaborator}
        />
      </div>
    </main>
  );
};

export default FeirinhaDaConcordiaAgenda;
