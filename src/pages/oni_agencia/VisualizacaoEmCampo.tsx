
import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { OniAgenciaMenu } from "@/components/oni_agencia/OniAgenciaMenu";
import { CalendarDays, RefreshCw } from "lucide-react";
import { ContentScheduleFilters } from "@/components/oni_agencia/content-schedule/ContentScheduleFilters";
import { useCollapsible } from "@/components/oni_agencia/content-schedule/hooks/useCollapsible";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/useOniAgenciaClients";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useInfiniteContentSchedules } from "@/hooks/oni_agencia/useInfiniteContentSchedules";

// Lazy loading do componente de lista para mobile
const MobileContentScheduleList = lazy(() => 
  import('@/components/oni_agencia/content-schedule/mobile/MobileContentScheduleList').then(module => ({ 
    default: module.MobileContentScheduleList 
  }))
);

// Componente de fallback durante carregamento
const LoadingFallback = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 w-full h-[calc(100vh-200px)]">
    <Skeleton className="w-full h-full rounded-md" />
  </div>
);

const VisualizacaoEmCampo = () => {
  const { toast } = useToast();
  const currentDate = new Date();
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const { isCollapsed, toggle: toggleFilters } = useCollapsible(true); // Iniciar com filtros recolhidos
  
  // Consulta otimizada de clientes com cache eficiente
  const { data: clients = [] } = useClients();
  
  // UseCallback para melhorar a performance
  const handleClientChange = useCallback((clientId: string) => {
    setSelectedClient(clientId);
  }, []);

  const handleCollaboratorChange = useCallback((collaboratorId: string | null) => {
    setSelectedCollaborator(collaboratorId);
  }, []);
  
  // Hook otimizado com infinite query
  const { 
    data: infiniteSchedules,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isRefetching
  } = useInfiniteContentSchedules(
    selectedClient || null, 
    selectedYear, 
    selectedMonth,
    selectedCollaborator
  );
  
  // Aplainar os dados paginados
  const flattenedSchedules = useMemo(() => {
    if (!infiniteSchedules?.pages) return [];
    return infiniteSchedules.pages.flatMap(page => page.data);
  }, [infiniteSchedules]);

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
    refetch();
  }, [refetch, toast]);

  // Exibir mensagem de erro caso ocorra
  useEffect(() => {
    const hasError = infiniteSchedules?.pages.some(page => page.error);
    if (hasError) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os agendamentos. Tente novamente mais tarde.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [infiniteSchedules, toast]);
  
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
              disabled={isRefetching || isLoading}
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
          <Suspense fallback={<LoadingFallback />}>
            <MobileContentScheduleList
              events={flattenedSchedules}
              clientId={selectedClient || "all"}
              selectedCollaborator={selectedCollaborator}
              isLoading={isLoading && !isFetchingNextPage}
              hasMore={hasNextPage}
              onLoadMore={() => fetchNextPage()}
              isLoadingMore={isFetchingNextPage}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
};

export default VisualizacaoEmCampo;
