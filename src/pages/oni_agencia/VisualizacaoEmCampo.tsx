
import { useState, useEffect, useCallback } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { CalendarDays, RefreshCw } from "lucide-react";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { Button } from "@/components/ui/button";
import { MobileContentScheduleList } from "@/components/oni_agencia/content-schedule/mobile/MobileContentScheduleList";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useToast } from "@/hooks/use-toast";
import { useOptimizedContentSchedules } from "@/hooks/oni_agencia/useOptimizedContentSchedules";
import { CalendarEvent } from "@/types/oni-agencia";

const VisualizacaoEmCampo = () => {
  const { toast } = useToast();
  const currentDate = new Date();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cachedEvents, setCachedEvents] = useState<CalendarEvent[]>([]);
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(true); // Iniciar com filtros recolhidos
  
  // Consulta otimizada de clientes com cache eficiente
  const { data: clients = [] } = useClients();
  
  // UseCallback para melhorar a performance
  const handleClientChange = useCallback((clientId: string) => {
    setSelectedClient(clientId);
    // Resetar a página quando mudar o filtro
    setCurrentPage(1);
  }, []);

  const handleCollaboratorChange = useCallback((collaboratorId: string | null) => {
    setSelectedCollaborator(collaboratorId);
    // Resetar a página quando mudar o filtro
    setCurrentPage(1);
  }, []);
  
  // Hook otimizado para busca de agendamentos com paginação e lazy loading
  const { 
    allItems: fetchedEvents,
    isLoading: isLoadingSchedules,
    refetch: refetchSchedules,
    isRefetching,
    hasMore,
    loadMore,
    isLoadingMore,
    error
  } = useOptimizedContentSchedules(
    selectedClient || null, 
    selectedYear, 
    selectedMonth,
    currentPage
  );
  
  // Cache de eventos para evitar problemas de renderização
  useEffect(() => {
    if (fetchedEvents && !isLoadingSchedules) {
      setCachedEvents(fetchedEvents);
    }
  }, [fetchedEvents, isLoadingSchedules]);

  // Refetch quando mês/ano/cliente muda
  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    // Resetar a página quando mudar o filtro
    setCurrentPage(1);
  }, []);

  const handleManualRefetch = useCallback(() => {
    toast({
      title: "Atualizando dados",
      description: "Buscando os agendamentos mais recentes...",
      duration: 3000,
    });
    // Resetar a página e refazer a consulta
    setCurrentPage(1);
    refetchSchedules();
  }, [refetchSchedules, toast]);

  // Função para carregar mais itens (lazy loading)
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasMore, isLoadingMore]);

  // Exibir mensagem de erro caso ocorra
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os agendamentos. Tente novamente mais tarde.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [error, toast]);
  
  return (
    <main className="container-fluid p-0 max-w-full bg-gray-50 min-h-screen">
      <OniAgenciaMenu />
      <div className="container mx-auto px-2 py-3 max-w-full">
        <div className="flex items-center gap-2 mb-4 bg-white p-4 rounded-lg shadow-sm">
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
        
        <div className="bg-white rounded-lg shadow-sm mb-4">
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
        </div>
        
        <div className={`w-full overflow-x-auto bg-gray-50 rounded-lg transition-all duration-300 ${isCollapsed ? 'h-[calc(100vh-180px)]' : 'h-[calc(100vh-280px)]'}`}>
          <MobileContentScheduleList
            events={cachedEvents || []}
            clientId={selectedClient || "all"}
            selectedCollaborator={selectedCollaborator}
            isLoading={isLoadingSchedules && currentPage === 1}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore || (isLoadingSchedules && currentPage > 1)}
          />
        </div>
      </div>
    </main>
  );
};

export default VisualizacaoEmCampo;
