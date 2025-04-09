
import { useState, useCallback, useEffect } from 'react';
import { subDays } from 'date-fns';
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
  pedidoItems: [],
  dataRangeInfo: {
    startDateRequested: '',
    endDateRequested: '',
    startDateActual: null,
    endDateActual: null,
    hasCompleteData: false
  }
};

export const useDashboardComercial = (): UseDashboardComercialReturn => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  const [dashboardData, setDashboardData] = useState<DashboardComercialData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [requestId, setRequestId] = useState<number>(0);
  
  const { toast } = useToast();

  const setDateRange = useCallback((start: Date, end: Date) => {
    console.log(`Definindo novo intervalo de datas: ${start.toISOString()} até ${end.toISOString()}`);
    setStartDate(start);
    setEndDate(end);
    setRequestId(prev => prev + 1);
  }, []);

  const fetchData = useCallback(async () => {
    // Prevent duplicate fetching if already loading
    if (isLoading) {
      console.log('Fetching already in progress, skipping duplicate request');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Iniciando busca de dados: ${startDate.toISOString()} até ${endDate.toISOString()}`);
      const data = await fetchDashboardComercialData(startDate, endDate);
      
      // Only update state if component is still mounted and data is valid
      if (data) {
        setDashboardData(data);
        console.log(`Dados carregados com sucesso: ${data.faturamentoItems.length} faturas, ${data.pedidoItems.length} pedidos`);
      
        // Verificar se há dados fora do intervalo
        if (data.faturamentoItems.length > 0) {
          const datasEmissao = data.faturamentoItems
            .filter(item => item.DATA_EMISSAO)
            .map(item => new Date(item.DATA_EMISSAO!));
          
          if (datasEmissao.length > 0) {
            const minData = new Date(Math.min(...datasEmissao.map(d => d.getTime())));
            const maxData = new Date(Math.max(...datasEmissao.map(d => d.getTime())));
            
            console.log(`Intervalo real de datas no faturamento: ${minData.toISOString()} até ${maxData.toISOString()}`);
            
            // Verificar se há datas fora do intervalo
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            const foraDoIntervalo = data.faturamentoItems.filter(item => {
              if (!item.DATA_EMISSAO) return false;
              const dataEmissao = new Date(item.DATA_EMISSAO);
              const dataEmissaoStr = dataEmissao.toISOString().split('T')[0];
              return dataEmissaoStr < startDateStr || dataEmissaoStr > endDateStr;
            });
            
            if (foraDoIntervalo.length > 0) {
              console.warn(`ATENÇÃO: ${foraDoIntervalo.length} de ${data.faturamentoItems.length} registros estão fora do intervalo de datas solicitado.`);
            }
          }
        }
        
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
            description: `Foram encontrados ${data.faturamentoItems.length} registros de faturamento para o período.`,
            variant: "default",
          });
        }
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
  }, [startDate, endDate, toast, isLoading]);

  const refreshData = useCallback(async () => {
    if (isLoading) return;
    
    toast({
      title: "Atualizando dados",
      description: "Carregando informações mais recentes...",
    });
    
    setRequestId(prev => prev + 1);
  }, [isLoading, toast]);

  // Use a cleanup function to prevent state updates after unmount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      console.log(`Efeito chamado para busca de dados: requestId=${requestId}`);
      if (isMounted) {
        await fetchData();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
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
