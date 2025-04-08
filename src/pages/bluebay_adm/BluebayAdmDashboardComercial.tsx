
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { FaturamentoTimeSeriesChart } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoTimeSeriesChart";
import { FaturamentoKpiCards } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoKpiCards";
import { DashboardComercialFilters } from "@/components/bluebay_adm/dashboard-comercial/DashboardComercialFilters";
import { FaturamentoTable } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoTable";
import { useDashboardComercial } from "@/hooks/bluebay_adm/dashboard/useDashboardComercial";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

const BluebayAdmDashboardComercial = () => {
  const {
    dashboardData,
    isLoading,
    startDate,
    endDate,
    setDateRange,
    refreshData
  } = useDashboardComercial();

  // Formatação das datas para exibição
  const formattedStartDate = startDate ? format(startDate, 'dd/MM/yyyy', { locale: ptBR }) : '';
  const formattedEndDate = endDate ? format(endDate, 'dd/MM/yyyy', { locale: ptBR }) : '';

  // Verifica se há dados disponíveis
  const hasData = dashboardData?.faturamentoItems && dashboardData.faturamentoItems.length > 0;
  
  // Obtém informações sobre o intervalo de dados
  const dataRangeInfo = dashboardData?.dataRangeInfo;
  
  // Verifica se o período solicitado tem dados limitados
  const hasLimitedData = dataRangeInfo && !dataRangeInfo.hasCompleteData;

  // Formata as datas reais para exibição
  const actualStartDate = dataRangeInfo?.startDateActual ? 
    format(new Date(dataRangeInfo.startDateActual), 'dd/MM/yyyy', { locale: ptBR }) : null;
    
  const actualEndDate = dataRangeInfo?.endDateActual ? 
    format(new Date(dataRangeInfo.endDateActual), 'dd/MM/yyyy', { locale: ptBR }) : null;

  return (
    <div className="min-h-screen bg-background">
      <BluebayAdmBanner />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <BluebayAdmMenu />
        </div>
        
        <h1 className="text-3xl font-bold mb-6">Dashboard Comercial</h1>
        
        <DashboardComercialFilters
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={setDateRange}
          onRefresh={refreshData}
          isLoading={isLoading}
        />
        
        {hasLimitedData && (
          <Alert variant="warning" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Dados limitados</AlertTitle>
            <AlertDescription>
              O período solicitado ({formattedStartDate} - {formattedEndDate}) contém dados apenas no intervalo 
              de {actualStartDate || '?'} até {actualEndDate || '?'}.
            </AlertDescription>
          </Alert>
        )}

        {!hasData && !isLoading && (
          <Alert variant="destructive" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Nenhum dado encontrado</AlertTitle>
            <AlertDescription>
              Não foram encontrados dados de faturamento para o período selecionado.
              Tente selecionar outro intervalo de datas.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mb-6">
          <FaturamentoKpiCards
            totalFaturado={dashboardData?.totalFaturado || 0}
            totalItens={dashboardData?.totalItens || 0}
            mediaValorItem={dashboardData?.mediaValorItem || 0}
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <FaturamentoTimeSeriesChart
            dailyData={dashboardData?.dailyFaturamento || []}
            monthlyData={dashboardData?.monthlyFaturamento || []}
            startDate={startDate}
            endDate={endDate}
            isLoading={isLoading}
          />
        </div>
        
        {/* Tabela de Notas Fiscais */}
        <FaturamentoTable 
          faturamentoData={dashboardData?.faturamentoItems || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default BluebayAdmDashboardComercial;
