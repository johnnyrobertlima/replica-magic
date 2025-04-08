
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

export const useDashboardData = () => {
  const { filters } = useFilters();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [representativeData, setRepresentativeData] = useState<RepresentativeData | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const isMountedRef = useRef(true);

  // Initialize pagination hooks for different data types that might need it
  const brandPagination = usePagination(1000);
  const repPagination = usePagination(1000);
  
  // Prepare query parameters that we can use for cache keys
  const queryParams = {
    startDate: filters.dateRange.startDate ? format(filters.dateRange.startDate, 'yyyy-MM-dd') : '',
    endDate: filters.dateRange.endDate ? format(filters.dateRange.endDate, 'yyyy-MM-dd') : '',
    brand: filters.brand || 'all',
    representative: filters.representative || 'all',
    status: filters.status || 'all',
    brandPage: brandPagination.currentPage,
    repPage: repPagination.currentPage
  };

  // Use React Query for data fetching with caching
  const { data: dashboardData, refetch } = useQuery({
    queryKey: ['dashboardData', queryParams],
    queryFn: async () => {
      try {
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
        
        return result;
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // Data remains fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache retention for 10 minutes
    enabled: !!(filters.dateRange.startDate && filters.dateRange.endDate), // Only run query when dates are available
    retry: 1 // Limit retries on failure
  });

  // Update state when data changes
  useEffect(() => {
    if (dashboardData && isMountedRef.current) {
      setKpiData(dashboardData.kpiData);
      setTimeSeriesData(dashboardData.timeSeriesData);
      setBrandData(dashboardData.brandData);
      setRepresentativeData(dashboardData.representativeData);
      setDeliveryData(dashboardData.deliveryData);
      
      // Update pagination total counts if included in the response
      if (dashboardData.totalCounts?.brands) {
        brandPagination.updateTotalCount(dashboardData.totalCounts.brands);
      }

      if (dashboardData.totalCounts?.representatives) {
        repPagination.updateTotalCount(dashboardData.totalCounts.representatives);
      }
      
      setIsLoading(false);
    }
  }, [dashboardData, brandPagination, repPagination]);

  // Effect to set loading state when query parameters change
  useEffect(() => {
    setIsLoading(true);
  }, [queryParams.startDate, queryParams.endDate, queryParams.brand, 
      queryParams.representative, queryParams.status]);

  // Component cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
