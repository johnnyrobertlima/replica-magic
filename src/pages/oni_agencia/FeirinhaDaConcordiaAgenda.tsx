
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

const FeirinhaDaConcordiaAgenda = () => {
  const { toast } = useToast();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(false);
  const [feirinhaClientId, setFeirinhaClientId] = useState<string | null>(null);
  
  // Buscar a lista de clientes para encontrar o ID da Feirinha da Concórdia
  const { data: clients, isLoading: isLoadingClients } = useClients();

  // Encontrar o ID do cliente Feirinha da Concórdia
  useEffect(() => {
    if (clients && clients.length > 0) {
      const feirinha = clients.find(client => 
        client.name.toLowerCase().includes('feirinha') && 
        client.name.toLowerCase().includes('concórdia')
      );
      
      if (feirinha) {
        console.log("Encontrado cliente Feirinha da Concórdia:", feirinha);
        setFeirinhaClientId(feirinha.id);
      } else {
        console.error("Cliente Feirinha da Concórdia não encontrado na lista de clientes");
        
        // Exibir todos os clientes no console para debug
        console.log("Lista de clientes disponíveis:", clients.map(c => ({ id: c.id, nome: c.name })));
        
        // Usar ID fixo como fallback
        setFeirinhaClientId("3f75b33c-2c10-4a3d-91f2-e4fd5ac37357");
      }
    }
  }, [clients]);

  const { 
    data: allSchedules = [], 
    isLoading: isLoadingSchedules,
    refetch: refetchSchedules,
    isRefetching
  } = useAllContentSchedules(selectedYear, selectedMonth);

  // Filter schedules for Feirinha da Concórdia only when we have the client ID
  const feirinhaSchedules = React.useMemo(() => {
    if (!feirinhaClientId) return [];
    
    console.log(`Filtrando ${allSchedules.length} agendamentos para o cliente ID: ${feirinhaClientId}`);
    
    const filtered = allSchedules.filter(schedule => 
      schedule.client_id === feirinhaClientId
    );
    
    console.log(`Encontrados ${filtered.length} agendamentos para Feirinha da Concórdia`);
    
    return filtered;
  }, [allSchedules, feirinhaClientId]);

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

  if (isLoadingClients) {
    return (
      <main className="container-fluid p-0 max-w-full">
        <OniAgenciaMenu />
        <div className="container mx-auto p-4 max-w-full">
          <div className="flex items-center justify-center h-[70vh]">
            <CalendarDays className="h-8 w-8 animate-spin mr-3" />
            <span className="text-xl">Carregando informações do cliente...</span>
          </div>
        </div>
      </main>
    );
  }

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
          selectedClient={feirinhaClientId || ""}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedCollaborator={selectedCollaborator}
          onClientChange={() => {}} // Disabled since we're showing only Feirinha da Concórdia
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
          onCollaboratorChange={handleCollaboratorChange}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleFilters}
          hideClientFilter={true} // New prop to hide client selector
        />
        
        <div className={`w-full overflow-x-auto ${isCollapsed ? 'h-[calc(100vh-150px)]' : 'h-[calc(100vh-250px)]'} transition-all duration-300`}>
          {isLoadingSchedules || !feirinhaClientId ? (
            <div className="flex items-center justify-center h-full">
              <CalendarDays className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando agendamentos...</span>
            </div>
          ) : feirinhaSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <CalendarDays className="h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-xl font-medium mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-500 text-center">
                Não há agendamentos para a Feirinha da Concórdia no período selecionado.
              </p>
            </div>
          ) : (
            viewMode === "calendar" ? (
              <ContentCalendar
                events={feirinhaSchedules}
                clientId={feirinhaClientId}
                month={selectedMonth}
                year={selectedYear}
                onMonthChange={handleMonthYearChange}
                selectedCollaborator={selectedCollaborator}
              />
            ) : (
              <ContentScheduleList
                events={feirinhaSchedules}
                clientId={feirinhaClientId}
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
