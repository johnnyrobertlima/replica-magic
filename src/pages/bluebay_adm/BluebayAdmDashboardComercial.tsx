
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { FaturamentoTimeSeriesChart } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoTimeSeriesChart";
import { FaturamentoKpiCards } from "@/components/bluebay_adm/dashboard-comercial/FaturamentoKpiCards";
import { DashboardComercialFilters } from "@/components/bluebay_adm/dashboard-comercial/DashboardComercialFilters";
import { useDashboardComercial } from "@/hooks/bluebay_adm/dashboard/useDashboardComercial";

const BluebayAdmDashboardComercial = () => {
  const {
    dashboardData,
    isLoading,
    startDate,
    endDate,
    setDateRange,
    refreshData
  } = useDashboardComercial();

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
      </div>
    </div>
  );
};

export default BluebayAdmDashboardComercial;
