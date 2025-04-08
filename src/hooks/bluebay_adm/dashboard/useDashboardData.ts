
import { useState, useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";
import { useFilters } from "@/contexts/bluebay_adm/FiltersContext";
import { fetchDashboardData } from "@/services/bluebay/dashboardService";
import { 
  KpiData, 
  TimeSeriesData,
  BrandData,
  RepresentativeData,
  DeliveryData
} from "@/types/bluebay/dashboardTypes";
import { usePagination } from "@/hooks/bluebay/hooks/usePagination";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export const useDashboardData = () => {
  const { filters } = useFilters();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [representativeData, setRepresentativeData] = useState<RepresentativeData | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const isMountedRef = useRef(true);

  // Inicializa paginações com limites maiores para evitar truncamento de dados
  const brandPagination = usePagination(5000);
  const repPagination = usePagination(5000);
  
  // Prepara parâmetros de query que podemos usar para chaves de cache
  const queryParams = {
    startDate: filters.dateRange.startDate ? format(filters.dateRange.startDate, 'yyyy-MM-dd') : '',
    endDate: filters.dateRange.endDate ? format(filters.dateRange.endDate, 'yyyy-MM-dd') : '',
    brand: filters.brand || 'all',
    representative: filters.representative || 'all',
    status: filters.status || 'all',
    brandPage: brandPagination.currentPage,
    repPage: repPagination.currentPage
  };

  // Usa React Query para obtenção de dados com cache
  const { data: dashboardData, refetch, isError } = useQuery({
    queryKey: ['dashboardData', queryParams],
    queryFn: async () => {
      try {
        console.log("Buscando dados do dashboard com filtros aplicados");
        
        const result = await fetchDashboardData({
          startDate: filters.dateRange.startDate,
          endDate: filters.dateRange.endDate,
          brand: filters.brand,
          representative: filters.representative,
          status: filters.status,
          pagination: {
            brandPagination: {
              page: brandPagination.currentPage,
              pageSize: brandPagination.pageSize
            },
            repPagination: {
              page: repPagination.currentPage,
              pageSize: repPagination.pageSize
            },
            noLimits: true // Indicador para buscar todos os dados, ignorando limites
          }
        });
        
        return result;
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Ocorreu um problema na busca dos dados. Tente novamente.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Dados permanecem frescos por 5 minutos
    gcTime: 10 * 60 * 1000, // Retenção de cache por 10 minutos
    enabled: !!(filters.dateRange.startDate && filters.dateRange.endDate), // Executa a query apenas quando as datas estão disponíveis
    retry: 1 // Limita tentativas em caso de falha
  });

  // Atualiza o estado quando os dados mudam
  useEffect(() => {
    if (dashboardData && isMountedRef.current) {
      setKpiData(dashboardData.kpiData);
      setTimeSeriesData(dashboardData.timeSeriesData);
      setBrandData(dashboardData.brandData);
      setRepresentativeData(dashboardData.representativeData);
      setDeliveryData(dashboardData.deliveryData);
      
      // Atualiza contagens totais de paginação se incluídas na resposta
      if (dashboardData.totalCounts?.brands) {
        brandPagination.updateTotalCount(dashboardData.totalCounts.brands);
      }

      if (dashboardData.totalCounts?.representatives) {
        repPagination.updateTotalCount(dashboardData.totalCounts.representatives);
      }
      
      setIsLoading(false);
    }
  }, [dashboardData, brandPagination, repPagination]);

  // Efeito para definir estado de carregamento quando os parâmetros de consulta mudam
  useEffect(() => {
    setIsLoading(true);
  }, [queryParams.startDate, queryParams.endDate, queryParams.brand, 
      queryParams.representative, queryParams.status]);

  // Limpa componente
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Exibe erros ao usuário
  useEffect(() => {
    if (isError) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Verifique sua conexão.",
        variant: "destructive",
      });
    }
  }, [isError]);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    refetch();
  }, [refetch]);

  return {
    isLoading,
    kpiData,
    timeSeriesData,
    brandData,
    representativeData,
    deliveryData,
    brandPagination,
    repPagination,
    refreshData
  };
};
