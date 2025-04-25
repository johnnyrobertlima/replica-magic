
import React, { useState, useEffect } from 'react';
import { useAllContentSchedules } from '@/hooks/useOniAgenciaContentSchedules';
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { ContentCalendar } from "@/components/oni_agencia/content-schedule/ContentCalendar";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { ContentScheduleList } from "@/components/oni_agencia/content-schedule/ContentScheduleList";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { CalendarDays, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EditorialLinePopover } from "@/components/oni_agencia/content-schedule/EditorialLinePopover";
import { ProductsPopover } from "@/components/oni_agencia/content-schedule/ProductsPopover";
import { useToast } from "@/hooks/use-toast";

// Feirinha da Concórdia client ID - replace with actual ID if necessary
const FEIRINHA_CLIENT_ID = "3f75b33c-2c10-4a3d-91f2-e4fd5ac37357";

const FeirinhaDaConcordiaAgenda = () => {
  const { toast } = useToast();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);

  const { 
    data: allSchedules = [], 
    isLoading: isLoadingSchedules,
    refetch: refetchSchedules,
    isRefetching
  } = useAllContentSchedules(selectedYear, selectedMonth);

  // Filter schedules for Feirinha da Concórdia only
  const feirinhaSchedules = React.useMemo(() => {
    console.log(`Filtering ${allSchedules.length} schedules for client ID: ${FEIRINHA_CLIENT_ID}`);
    return allSchedules.filter(schedule => 
      schedule.client_id === FEIRINHA_CLIENT_ID
    );
  }, [allSchedules]);

  useEffect(() => {
    console.log(`Found ${feirinhaSchedules.length} schedules for Feirinha da Concórdia`);
  }, [feirinhaSchedules]);

  const handleMonthYearChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleViewChange = (value: string) => {
    if (value === "calendar" || value === "list") {
      setViewMode(value);
    }
  };

  const handleCollaboratorChange = (collaboratorId: string | null) => {
    setSelectedCollaborator(collaboratorId);
  };

  const handleRefetch = async () => {
    try {
      await refetchSchedules();
      toast({
        title: "Agenda atualizada",
        description: "Os dados da agenda foram atualizados com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os dados da agenda.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-4 max-w-full">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Agenda - Feirinha da Concórdia</h1>
          <div className="ml-auto flex items-center gap-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={handleViewChange}>
              <ToggleGroupItem value="calendar" aria-label="Visualização em calendário">
                <CalendarDays className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Visualização em lista">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <EditorialLinePopover events={feirinhaSchedules} />
            <ProductsPopover events={feirinhaSchedules} />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefetch}
              disabled={isRefetching || isLoadingSchedules}
            >
              <CalendarDays className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </Button>
          </div>
        </div>
        
        <ContentScheduleFilters
          selectedClient={FEIRINHA_CLIENT_ID}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedCollaborator={selectedCollaborator}
          onClientChange={() => {}} // Disabled since we're showing only Feirinha da Concórdia
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onCollaboratorChange={handleCollaboratorChange}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleFilters}
        />
        
        <div className={`w-full overflow-x-auto ${isCollapsed ? 'h-[calc(100vh-150px)]' : 'h-[calc(100vh-250px)]'} transition-all duration-300`}>
          {isLoadingSchedules ? (
            <div className="flex items-center justify-center h-full">
              <CalendarDays className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando agendamentos...</span>
            </div>
          ) : (
            viewMode === "calendar" ? (
              <ContentCalendar
                events={feirinhaSchedules}
                clientId={FEIRINHA_CLIENT_ID}
                month={selectedMonth}
                year={selectedYear}
                onMonthChange={handleMonthYearChange}
                selectedCollaborator={selectedCollaborator}
              />
            ) : (
              <ContentScheduleList
                events={feirinhaSchedules}
                clientId={FEIRINHA_CLIENT_ID}
                selectedCollaborator={selectedCollaborator}
              />
            )
          )}
        </div>
      </div>
    </main>
  );
};

export default FeirinhaDaConcordiaAgenda;
