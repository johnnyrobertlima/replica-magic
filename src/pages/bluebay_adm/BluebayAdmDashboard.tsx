
import { BluebayAdmBanner } from "@/components/bluebay_adm/BluebayAdmBanner";
import { BluebayAdmMenu } from "@/components/bluebay_adm/BluebayAdmMenu";
import { DashboardHeader } from "@/components/bluebay_adm/dashboard/DashboardHeader";
import { KpiCards } from "@/components/bluebay_adm/dashboard/KpiCards";
import { TimeSeriesCharts } from "@/components/bluebay_adm/dashboard/TimeSeriesCharts";
import { BrandPerformance } from "@/components/bluebay_adm/dashboard/BrandPerformance";
import { RepresentativeRanking } from "@/components/bluebay_adm/dashboard/RepresentativeRanking";
import { DeliveryEfficiency } from "@/components/bluebay_adm/dashboard/DeliveryEfficiency";
import { useDashboardData } from "@/hooks/bluebay_adm/dashboard/useDashboardData";
import { DashboardFilters } from "@/components/bluebay_adm/dashboard/DashboardFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { FiltersProvider } from "@/contexts/bluebay_adm/FiltersContext";

const BluebayAdmDashboard = () => {
  return (
    <main className="container-fluid p-0 max-w-full">
      <BluebayAdmBanner />
      <BluebayAdmMenu />
      
      <FiltersProvider>
        <div className="container mx-auto px-4 py-6">
          <DashboardHeader />
          
          <DashboardFiltersWrapper />
          
          <DashboardContent />
        </div>
      </FiltersProvider>
    </main>
  );
};

// Separate component to use hooks inside the FiltersProvider context
const DashboardFiltersWrapper = () => {
  const { refreshData } = useDashboardData();
  
  return (
    <DashboardFilters onFilterChange={refreshData} />
  );
};

// Separate component to use hooks inside the FiltersProvider context
const DashboardContent = () => {
  const {
    isLoading,
    kpiData,
    timeSeriesData,
    brandData,
    representativeData,
    deliveryData,
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <>
      <KpiCards data={kpiData} />
      <TimeSeriesCharts data={timeSeriesData} />
      <BrandPerformance data={brandData} />
      <RepresentativeRanking data={representativeData} />
      <DeliveryEfficiency data={deliveryData} />
    </>
  );
};

export default BluebayAdmDashboard;
