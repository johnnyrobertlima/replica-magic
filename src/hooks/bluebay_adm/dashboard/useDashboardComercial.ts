
import { useState, useCallback, useEffect } from 'react';
import { subMonths } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { 
  fetchDashboardComercialData
} from '@/services/bluebay/dashboardComercialService';
import { DashboardComercialData } from '@/services/bluebay/dashboardComercialTypes';

interface UseDashboardComercialReturn {
  dashboardData: DashboardComercialData | null;
  isLoading: boolean;
  error: Error | null;
  startDate: Date;
  endDate: Date;
  setDateRange: (startDate: Date, endDate: Date) => void;
  refreshData: () => Promise<void>;
}

const defaultData: DashboardComercialData = {
  dailyFaturamento: [],
  monthlyFaturamento: [],
  totalFaturado: 0,
  totalItens: 0,
  mediaValorItem: 0,
  faturamentoItems: [],
  pedidoItems: [], // Added this missing property
  dataRangeInfo: {
    startDateRequested: '',
    endDateRequested: '',
    startDateActual: null,
    endDateActual: null,
    hasCompleteData: false
  }
};

export const useDashboardComercial = (): UseDashboardComercialReturn => {
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 6));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  const [dashboardData, setDashboardData] = useState<DashboardComercialData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [requestId, setRequestId] = useState<number>(0);
  
  const { toast } = useToast();

  const setDateRange = useCallback((start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setRequestId(prev => prev + 1);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchDashboardComercialData(startDate, endDate);
      setDashboardData(data);
      console.log('Dados carregados com sucesso:', data);
      
      if (data.faturamentoItems.length === 0) {
        toast({
          title: "Sem dados disponíveis",
          description: "Não foram encontrados dados de faturamento para o período selecionado.",
          variant: "destructive",
        });
      } 
      else {
        toast({
          title: "Dados carregados com sucesso",
          description: `Foram encontrados ${data.faturamentoItems.length} registros de faturamento.`,
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard comercial:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao buscar dados'));
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setDashboardData(defaultData);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, toast]);

  const refreshData = useCallback(async () => {
    if (isLoading) return;
    
    toast({
      title: "Atualizando dados",
      description: "Carregando informações mais recentes...",
    });
    
    setRequestId(prev => prev + 1);
  }, [isLoading, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData, requestId]);

  return {
    dashboardData,
    isLoading,
    error,
    startDate,
    endDate,
    setDateRange,
    refreshData
  };
};
