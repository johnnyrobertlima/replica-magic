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
import { useClients } from '@/hooks/useOniAgenciaClients';

const PromobrasAgenda = () => {
  const { toast } = useToast();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);
  const [clientId, setClientId] = useState<string | null>(null);
  
  const { data: clients, isLoading: isLoadingClients } = useClients();

  useEffect(() => {
    if (clients && clients.length > 0) {
      const client = clients.find(client => 
        client.name.toLowerCase().includes('promobras')
      );
      
      if (client) {
        console.log("Found Promobras client:", client);
        setClientId(client.id);
      } else {
        console.error("Promobras client not found in clients list");
        console.log("Available clients:", clients.map(c => ({ id: c.id, name: c.name })));
      }
    }
  }, [clients]);

  const { 
    data: filteredSchedules = [], 
    isLoading: isLoadingSchedules,
    refetch: refetchSchedules,
    isRefetching
  } = useAllContentSchedules(selectedYear, selectedMonth);

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
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os dados da agenda.",
      });
    }
  };

  return (
    <main className="container-fluid p-0 max-w-full">
      <OniAgenciaMenu />
      <div className="container mx-auto p-4 max-w-full">
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">Agenda - Promobras</h1>
          <div className="ml-auto flex items-center gap-2">
            <ToggleGroup type="single" value={viewMode} onValueChange={handleViewChange}>
              <ToggleGroupItem value="calendar" aria-label="Visualização em calendário">
                <CalendarDays className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="Visualização em lista">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <EditorialLinePopover events={filteredSchedules} />
            <ProductsPopover events={filteredSchedules} />
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
          selectedClient={clientId || ""}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedCollaborator={selectedCollaborator}
          onClientChange={() => {}}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onCollaboratorChange={handleCollaboratorChange}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleFilters}
          hideClientFilter={true}
        />
        
        <div className={`w-full overflow-x-auto ${isCollapsed ? 'h-[calc(100vh-150px)]' : 'h-[calc(100vh-250px)]'} transition-all duration-300`}>
          {viewMode === "calendar" ? (
            <ContentCalendar
              events={filteredSchedules}
              clientId={clientId || ""}
              month={selectedMonth}
              year={selectedYear}
              onMonthChange={handleMonthYearChange}
              selectedCollaborator={selectedCollaborator}
            />
          ) : (
            <ContentScheduleList
              events={filteredSchedules}
              clientId={clientId || ""}
              selectedCollaborator={selectedCollaborator}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default PromobrasAgenda;
