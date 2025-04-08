
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { FaturamentoTimeSeriesChart } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoTimeSeriesChart";
import { FaturamentoKpiCards } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoKpiCards";
import { DashboardComercialFilters } from "@/components/bluebay_adm/dashboard-comercial/DashboardComercialFilters";
import { FaturamentoTable } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoTable";
import { CentroCustoIndicators } from "@/components/bluebay_adm/dashboard-comercial/CentroCustoIndicators";
import { useDashboardComercial } from "@/hooks/bluebay_adm/dashboard/useDashboardComercial";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const BluebayAdmDashboardComercial = () => {
  const {
    dashboardData,
    isLoading,
    startDate,
    endDate,
    setDateRange,
    refreshData
  } = useDashboardComercial();

  // Verifica se há dados disponíveis
  const hasData = dashboardData?.faturamentoItems && dashboardData.faturamentoItems.length > 0;

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
        
        {/* Indicadores por Centro de Custo */}
        <CentroCustoIndicators 
          faturamentoItems={dashboardData?.faturamentoItems || []}
          pedidoItems={dashboardData?.pedidoItems || []}
          isLoading={isLoading}
        />
        
        {/* Tabela de Notas Fiscais e Pedidos */}
        <FaturamentoTable 
          faturamentoData={dashboardData?.faturamentoItems || []}
          pedidoData={dashboardData?.pedidoItems || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default BluebayAdmDashboardComercial;
