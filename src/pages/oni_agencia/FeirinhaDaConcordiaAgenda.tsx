
import React, { useState } from 'react';
import { useAllContentSchedules } from '@/hooks/useOniAgenciaContentSchedules';
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { ContentCalendar } from "@/components/oni_agencia/content-schedule/ContentCalendar";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { ContentScheduleList } from "@/components/oni_agencia/content-schedule/ContentScheduleList";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EditorialLinePopover } from "@/components/oni_agencia/content-schedule/EditorialLinePopover";
import { ProductsPopover } from "@/components/oni_agencia/content-schedule/ProductsPopover";

const FEIRINHA_CLIENT_ID = "3f75b33c-2c10-4a3d-91f2-e4fd5ac37357"; // Replace with actual Feirinha da Concórdia client ID

const FeirinhaDaConcordiaAgenda = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);

  const { 
    data: filteredSchedules = [], 
    isLoading: isLoadingSchedules,
    refetch: refetchSchedules,
    isRefetching
  } = useAllContentSchedules(selectedYear, selectedMonth);

  // Filter schedules for Feirinha da Concórdia only
  const feirinhaSchedules = filteredSchedules.filter(
    schedule => schedule.client_id === FEIRINHA_CLIENT_ID
  );

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
                <CalendarDays className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <EditorialLinePopover events={feirinhaSchedules} />
            <ProductsPopover events={feirinhaSchedules} />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchSchedules()}
              disabled={isRefetching || isLoadingSchedules}
            >
              <CalendarDays className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              <span className="ml-2">Atualizar</span>
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
          {viewMode === "calendar" ? (
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
          )}
        </div>
      </div>
    </main>
  );
};

export default FeirinhaDaConcordiaAgenda;
