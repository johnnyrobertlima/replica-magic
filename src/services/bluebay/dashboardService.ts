import { 
  KpiData, 
  TimeSeriesData,
  BrandData,
  RepresentativeData,
  DeliveryData,
  DashboardFilterParams
} from "@/types/bluebay/dashboardTypes";
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches dashboard data based on filters
 */
export const fetchBluebayDashboardData = async (filters: DashboardFilterParams) => {
  try {
    console.info("Fetching dashboard data with params:", filters);
    
    // In a real implementation, we would call Supabase functions/tables with the filters
    // For now, returning mock data
    
    // Parse representative to ensure we pass a number if needed
    let representativeId: number | null = null;
    if (filters.representative) {
      representativeId = parseInt(filters.representative, 10);
      // If parsing fails, keep it as null
      if (isNaN(representativeId)) {
        representativeId = null;
      }
    }
    
    // Here you would call your actual data endpoints with the proper filters
    
    return {
      kpi: getMockKpiData(),
      timeSeries: getMockTimeSeriesData(),
      brands: getMockBrandData(),
      representatives: getMockRepresentativeData(),
      delivery: getMockDeliveryData()
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// Mock data generator functions
function getMockKpiData(): KpiData {
  return {
    totalOrders: 1250,
    totalBilled: 850000,
    conversionRate: 0.76,
    orderedPieces: 8500,
    billedPieces: 7300,
    averageDiscount: 0.12
  };
}

function getMockTimeSeriesData(): TimeSeriesData {
  return {
    monthlySeries: [
      { date: "2025-01", ordersValue: 210000, billedValue: 185000, orderedPieces: 1200, billedPieces: 1050 },
      { date: "2025-02", ordersValue: 240000, billedValue: 210000, orderedPieces: 1400, billedPieces: 1300 },
      { date: "2025-03", ordersValue: 300000, billedValue: 275000, orderedPieces: 1800, billedPieces: 1650 },
      { date: "2025-04", ordersValue: 350000, billedValue: 330000, orderedPieces: 2100, billedPieces: 1950 }
    ]
  };
}

function getMockBrandData(): BrandData {
  return {
    items: [
      { brand: "Brand A", totalOrders: 320000, totalBilled: 295000, conversionRate: 0.92, volume: 1800 },
      { brand: "Brand B", totalOrders: 280000, totalBilled: 240000, conversionRate: 0.86, volume: 1500 },
      { brand: "Brand C", totalOrders: 180000, totalBilled: 150000, conversionRate: 0.83, volume: 1200 }
    ]
  };
}

function getMockRepresentativeData(): RepresentativeData {
  return {
    items: [
      { code: "1", name: "John Smith", totalOrders: 120000, totalBilled: 115000, conversionRate: 0.96, averageTicket: 5750 },
      { code: "2", name: "Mary Johnson", totalOrders: 180000, totalBilled: 165000, conversionRate: 0.92, averageTicket: 6350 },
      { code: "3", name: "Robert Brown", totalOrders: 220000, totalBilled: 195000, conversionRate: 0.89, averageTicket: 5100 }
    ]
  };
}

function getMockDeliveryData(): DeliveryData {
  return {
    fullyDeliveredPercentage: 0.72,
    partialPercentage: 0.18,
    openPercentage: 0.10,
    averageRemainingQuantity: 11.5
  };
}
