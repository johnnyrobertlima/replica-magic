
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
import { usePagination } from "@/hooks/bluebay/hooks/usePagination";

export const useDashboardData = () => {
  const { filters } = useFilters();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [representativeData, setRepresentativeData] = useState<RepresentativeData | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);

  // Initialize pagination hooks for different data types that might need it
  const brandPagination = usePagination(1000);
  const repPagination = usePagination(1000);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const startDate = format(filters.dateRange.startDate, 'yyyy-MM-dd');
      const endDate = format(filters.dateRange.endDate, 'yyyy-MM-dd');

      // Pass pagination information to the fetch function
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
          noLimits: true // Flag to indicate we want to fetch all data with no limits
        }
      });

      // Update pagination total counts if included in the response
      if (result.totalCounts?.brands) {
        brandPagination.updateTotalCount(result.totalCounts.brands);
      }

      if (result.totalCounts?.representatives) {
        repPagination.updateTotalCount(result.totalCounts.representatives);
      }

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
  }, [filters, brandPagination, repPagination]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // When pagination changes, fetch data again
  useEffect(() => {
    if (!isLoading) {
      fetchData();
    }
  }, [brandPagination.currentPage, repPagination.currentPage]);

  return {
    isLoading,
    kpiData,
    timeSeriesData,
    brandData,
    representativeData,
    deliveryData,
    brandPagination,
    repPagination,
    refreshData: fetchData
  };
};
