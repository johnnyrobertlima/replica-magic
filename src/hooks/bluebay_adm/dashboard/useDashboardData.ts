
import { useState, useEffect, useCallback } from "react";
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

export const useDashboardData = () => {
  const { filters } = useFilters();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [representativeData, setRepresentativeData] = useState<RepresentativeData | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const startDate = format(filters.dateRange.startDate, 'yyyy-MM-dd');
      const endDate = format(filters.dateRange.endDate, 'yyyy-MM-dd');

      const result = await fetchDashboardData({
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate,
        brand: filters.brand,
        representative: filters.representative,
        status: filters.status
      });

      setKpiData(result.kpiData);
      setTimeSeriesData(result.timeSeriesData);
      setBrandData(result.brandData);
      setRepresentativeData(result.representativeData);
      setDeliveryData(result.deliveryData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    kpiData,
    timeSeriesData,
    brandData,
    representativeData,
    deliveryData,
    refreshData: fetchData
  };
};
