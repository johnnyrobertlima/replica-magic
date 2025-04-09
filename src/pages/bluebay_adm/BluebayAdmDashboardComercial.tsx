
import { useState, useCallback } from "react";
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { DashboardComercialFilters } from "@/components/bluebay_adm/dashboard-comercial/DashboardComercialFilters";
import { useDashboardComercial } from "@/hooks/bluebay_adm/dashboard/useDashboardComercial";
import { DashboardContent } from "@/components/bluebay_adm/dashboard-comercial/DashboardContent";

const BluebayAdmDashboardComercial = () => {
  const {
    dashboardData,
    isLoading,
    startDate,
    endDate,
    setDateRange,
    refreshData
  } = useDashboardComercial();
  
  // Estado para controlar o filtro de Centro de Custo
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<string | null>(null);

  // Usar useCallback para evitar recriação da função a cada render
  const handleCentroCustoChange = useCallback((centroCusto: string | null) => {
    setSelectedCentroCusto(centroCusto);
  }, []);

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

        <DashboardContent
          dashboardData={dashboardData}
          selectedCentroCusto={selectedCentroCusto}
          setSelectedCentroCusto={handleCentroCustoChange}
          isLoading={isLoading}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
};

export default BluebayAdmDashboardComercial;
