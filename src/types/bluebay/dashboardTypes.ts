
// KPI Data Types
export interface KpiData {
  totalOrders: number;
  totalBilled: number;
  conversionRate: number;
  orderedPieces: number;
  billedPieces: number;
  averageDiscount: number;
}

// Time Series Data Types
export interface TimeSeriesPoint {
  date: string;
  ordersValue: number;
  billedValue: number;
  orderedPieces: number;
  billedPieces: number;
}

export interface TimeSeriesData {
  monthlySeries: TimeSeriesPoint[];
}

// Brand Performance Types
export interface BrandPerformanceItem {
  brand: string;
  totalOrders: number;
  totalBilled: number;
  conversionRate: number;
  volume: number;
}

export interface BrandData {
  items: BrandPerformanceItem[];
}

// Delivery Efficiency Types
export interface DeliveryData {
  fullyDeliveredPercentage: number;
  partialPercentage: number;
  openPercentage: number;
  averageRemainingQuantity: number;
}

// Dashboard Filters Types
export interface DashboardFilterParams {
  startDate: string;
  endDate: string;
  brand: string | null;
  status: string | null;
  pagination?: {
    brandPagination?: { page: number, pageSize: number };
    noLimits?: boolean;
  };
}

// Dashboard Pagination Types
export interface DashboardPagination {
  page: number;
  pageSize: number;
  totalCount: number;
}
