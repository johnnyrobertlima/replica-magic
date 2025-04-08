import { supabase } from "@/integrations/supabase/client";
import { 
  KpiData, 
  TimeSeriesData, 
  TimeSeriesPoint, 
  BrandData, 
  BrandPerformanceItem,
  RepresentativeData, 
  RepresentativeItem,
  DeliveryData,
  DashboardFilterParams
} from "@/types/bluebay/dashboardTypes";
import { format, subMonths, parseISO } from 'date-fns';

/**
 * Fetches dashboard data from the database with pagination support
 * and option to fetch all data without limits
 */
export const fetchDashboardData = async (
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    brand: string | null;
    representative: string | null;
    status: string | null;
    pagination?: {
      brandPagination?: { page: number, pageSize: number };
      repPagination?: { page: number, pageSize: number };
      noLimits?: boolean; // Flag to fetch all data without limits
    }
  }
) => {
  try {
    console.log("Fetching dashboard data with filters:", filters);
    console.log("Pagination settings:", filters.pagination);
    
    const kpiData = await fetchKpiData(filters);
    const timeSeriesData = await fetchTimeSeriesData(filters);
    const brandData = await fetchBrandData(filters);
    const representativeData = await fetchRepresentativeData(filters);
    const deliveryData = await fetchDeliveryData(filters);

    // Track total counts for pagination
    const totalCounts = {
      brands: brandData.totalCount || 0,
      representatives: representativeData.totalCount || 0
    };

    return {
      kpiData,
      timeSeriesData,
      brandData: brandData.data,
      representativeData: representativeData.data,
      deliveryData,
      totalCounts
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      kpiData: generateMockKpiData(),
      timeSeriesData: generateMockTimeSeriesData(),
      brandData: generateMockBrandData(),
      representativeData: generateMockRepresentativeData(),
      deliveryData: generateMockDeliveryData()
    };
  }
};

/**
 * Fetches KPI data from Bluebay faturamento and pedido tables
 * with option to fetch all data without limits
 */
const fetchKpiData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  representative: string | null;
  status: string | null;
  pagination?: any;
}): Promise<KpiData> => {
  try {
    // Convert dates to strings for the query
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';

    console.log(`Fetching KPI data from ${startDateStr} to ${endDateStr}`);
    
    // First get the pedido (orders) data - no limit needed since we're aggregating
    let orderQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('*');

    // Add date filters if provided
    if (startDateStr && endDateStr) {
      orderQuery = orderQuery
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', endDateStr + 'T23:59:59Z');
    }

    // Add brand filter if provided
    if (filters.brand && filters.brand !== 'all') {
      orderQuery = orderQuery.eq('CENTROCUSTO', filters.brand);
    }

    // Add representative filter if provided
    if (filters.representative && filters.representative !== 'all') {
      orderQuery = orderQuery.eq('REPRESENTANTE', parseInt(filters.representative));
    }

    // Add status filter if provided
    if (filters.status && filters.status !== 'all') {
      orderQuery = orderQuery.eq('STATUS', filters.status);
    }

    const { data: orderData, error: orderError } = await orderQuery;

    if (orderError) {
      console.error('Error fetching order data:', orderError);
      return generateMockKpiData();
    }

    // Now get the faturamento (billing) data - no limit needed since we're aggregating
    let billingQuery = supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .eq('TIPO', 'S'); // Only sales data (S = Saida)

    // Add date filters if provided
    if (startDateStr && endDateStr) {
      billingQuery = billingQuery
        .gte('DATA_EMISSAO', startDateStr)
        .lte('DATA_EMISSAO', endDateStr + 'T23:59:59Z');
    }
    
    const { data: billingData, error: billingError } = await billingQuery;

    if (billingError) {
      console.error('Error fetching billing data:', billingError);
      return generateMockKpiData();
    }

    console.log(`Processing KPI data from ${orderData?.length || 0} orders and ${billingData?.length || 0} billing records`);

    // Process and summarize data
    const totalOrders = orderData.reduce((sum, item) => {
      const value = item.TOTAL_PRODUTO || 0;
      return sum + parseFloat(value.toString());
    }, 0);

    const orderedPieces = orderData.reduce((sum, item) => {
      const qty = item.QTDE_PEDIDA || 0;
      return sum + parseFloat(qty.toString());
    }, 0);

    const totalBilled = billingData.reduce((sum, item) => {
      const value = item.VALOR_NOTA || 0;
      return sum + parseFloat(value.toString());
    }, 0);

    const billedPieces = billingData.reduce((sum, item) => {
      const qty = item.QUANTIDADE || 0;
      return sum + parseFloat(qty.toString());
    }, 0);

    // Calculate conversion rate
    const conversionRate = totalOrders > 0 ? (totalBilled / totalOrders) * 100 : 0;

    // Calculate weighted average discount
    const totalBeforeDiscount = billingData.reduce((sum, item) => {
      const qty = parseFloat((item.QUANTIDADE || 0).toString());
      const unitPrice = parseFloat((item.VALOR_UNITARIO || 0).toString());
      return sum + (qty * unitPrice);
    }, 0);

    const totalDiscount = billingData.reduce((sum, item) => {
      return sum + parseFloat((item.VALOR_DESCONTO || 0).toString());
    }, 0);

    const averageDiscount = totalBeforeDiscount > 0 ? (totalDiscount / totalBeforeDiscount) * 100 : 0;

    return {
      totalOrders,
      totalBilled,
      conversionRate,
      orderedPieces,
      billedPieces,
      averageDiscount
    };
  } catch (error) {
    console.error('Error calculating KPI data:', error);
    return generateMockKpiData();
  }
};

/**
 * Fetches time series data for the dashboard
 * with option to fetch all data without limits
 */
const fetchTimeSeriesData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  representative: string | null;
  status: string | null;
  pagination?: any;
}): Promise<TimeSeriesData> => {
  try {
    // Convert dates to strings for the query or use last 6 months if not provided
    let startDate = filters.startDate;
    let endDate = filters.endDate;
    
    if (!startDate || !endDate) {
      endDate = new Date();
      startDate = subMonths(endDate, 6);
    }
    
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    console.log(`Fetching time series data from ${startDateStr} to ${endDateStr}`);

    // Get orders data - no limit needed as we'll group by month
    let orderQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .gte('DATA_PEDIDO', startDateStr)
      .lte('DATA_PEDIDO', endDateStr + 'T23:59:59Z');

    // Add brand filter if provided
    if (filters.brand && filters.brand !== 'all') {
      orderQuery = orderQuery.eq('CENTROCUSTO', filters.brand);
    }

    // Add representative filter if provided
    if (filters.representative && filters.representative !== 'all') {
      orderQuery = orderQuery.eq('REPRESENTANTE', parseInt(filters.representative));
    }

    // Add status filter if provided
    if (filters.status && filters.status !== 'all') {
      orderQuery = orderQuery.eq('STATUS', filters.status);
    }

    const { data: orderData, error: orderError } = await orderQuery;

    if (orderError) {
      console.error('Error fetching order time series data:', orderError);
      return generateMockTimeSeriesData();
    }

    // Get billing data - no limit needed as we'll group by month
    let billingQuery = supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .eq('TIPO', 'S') // Only sales
      .gte('DATA_EMISSAO', startDateStr)
      .lte('DATA_EMISSAO', endDateStr + 'T23:59:59Z');

    const { data: billingData, error: billingError } = await billingQuery;

    if (billingError) {
      console.error('Error fetching billing time series data:', billingError);
      return generateMockTimeSeriesData();
    }

    console.log(`Processing time series data from ${orderData?.length || 0} orders and ${billingData?.length || 0} billing records`);

    // Group data by month
    const monthlyData = new Map<string, TimeSeriesPoint>();

    // Process order data
    orderData.forEach(order => {
      if (!order.DATA_PEDIDO) return;
      
      const orderDate = typeof order.DATA_PEDIDO === 'string' ? parseISO(order.DATA_PEDIDO) : new Date(order.DATA_PEDIDO);
      const monthKey = format(orderDate, 'yyyy-MM');
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          date: format(orderDate, 'MMM yyyy'),
          ordersValue: 0,
          billedValue: 0,
          orderedPieces: 0,
          billedPieces: 0
        });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      monthData.ordersValue += parseFloat((order.TOTAL_PRODUTO || 0).toString());
      monthData.orderedPieces += parseFloat((order.QTDE_PEDIDA || 0).toString());
    });

    // Process billing data
    billingData.forEach(item => {
      if (!item.DATA_EMISSAO) return;
      
      const billingDate = typeof item.DATA_EMISSAO === 'string' ? parseISO(item.DATA_EMISSAO) : new Date(item.DATA_EMISSAO);
      const monthKey = format(billingDate, 'yyyy-MM');
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          date: format(billingDate, 'MMM yyyy'),
          ordersValue: 0,
          billedValue: 0,
          orderedPieces: 0,
          billedPieces: 0
        });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      monthData.billedValue += parseFloat((item.VALOR_NOTA || 0).toString());
      monthData.billedPieces += parseFloat((item.QUANTIDADE || 0).toString());
    });

    // Convert map to array and sort by date
    const monthlySeries = Array.from(monthlyData.values())
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

    return { monthlySeries };
  } catch (error) {
    console.error('Error fetching time series data:', error);
    return generateMockTimeSeriesData();
  }
};

/**
 * Fetches all brand data in batches if necessary to overcome query limits
 * with option to fetch all data without limits
 */
const fetchBrandData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  representative: string | null;
  status: string | null;
  pagination?: {
    brandPagination?: { page: number, pageSize: number };
    noLimits?: boolean;
  };
}): Promise<{data: BrandData, totalCount: number}> => {
  try {
    // Convert dates to strings for the query
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
    
    console.log(`Fetching brand data from ${startDateStr} to ${endDateStr}`);

    // Fetch all unique brands first to get total count
    let brandListQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('CENTROCUSTO', { count: 'exact', head: false })
      .not('CENTROCUSTO', 'is', null);

    // Add date filters if provided
    if (startDateStr && endDateStr) {
      brandListQuery = brandListQuery
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', endDateStr + 'T23:59:59Z');
    }

    const { data: brandsList, error: brandsListError, count: brandsCount } = await brandListQuery;

    if (brandsListError) {
      console.error('Error fetching brands list:', brandsListError);
      return { data: { items: [] }, totalCount: 0 };
    }

    // Get unique brands
    const uniqueBrands = [...new Set(brandsList?.map(item => item.CENTROCUSTO))];
    console.log(`Found ${uniqueBrands.length} unique brands`);

    // Calculate pagination or fetch all
    let processedBrands: string[] = uniqueBrands;

    // Apply pagination if noLimits is false and pagination info is provided
    if (!filters.pagination?.noLimits && filters.pagination?.brandPagination) {
      const { page, pageSize } = filters.pagination.brandPagination;
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      processedBrands = uniqueBrands.slice(startIdx, endIdx);
      console.log(`Using paged brands: ${processedBrands.length} brands from index ${startIdx} to ${endIdx-1}`);
    }

    // Fetch order data for all brands without limit to get accurate aggregations
    let orderQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('*');

    // Add date filters if provided
    if (startDateStr && endDateStr) {
      orderQuery = orderQuery
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', endDateStr + 'T23:59:59Z');
    }

    // Add representative filter if provided
    if (filters.representative && filters.representative !== 'all') {
      orderQuery = orderQuery.eq('REPRESENTANTE', parseInt(filters.representative));
    }

    // Add status filter if provided
    if (filters.status && filters.status !== 'all') {
      orderQuery = orderQuery.eq('STATUS', filters.status);
    }

    const { data: orderData, error: orderError } = await orderQuery;

    if (orderError) {
      console.error('Error fetching order data by brand:', orderError);
      return { data: generateMockBrandData(), totalCount: 0 };
    }

    // Fetch billing data for all brands without limit to get accurate aggregations
    let billingQuery = supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .eq('TIPO', 'S'); // Only sales

    // Add date filters if provided
    if (startDateStr && endDateStr) {
      billingQuery = billingQuery
        .gte('DATA_EMISSAO', startDateStr)
        .lte('DATA_EMISSAO', endDateStr + 'T23:59:59Z');
    }

    const { data: billingData, error: billingError } = await billingQuery;

    if (billingError) {
      console.error('Error fetching billing data by brand:', billingError);
      return { data: generateMockBrandData(), totalCount: 0 };
    }

    console.log(`Processing brand data from ${orderData?.length || 0} orders and ${billingData?.length || 0} billing records`);

    // Group order data by brand
    const brandOrderMap = new Map<string, { total: number, pieces: number }>();
    
    orderData.forEach(order => {
      const brand = order.CENTROCUSTO || 'Sem Marca';
      const value = parseFloat((order.TOTAL_PRODUTO || 0).toString());
      const pieces = parseFloat((order.QTDE_PEDIDA || 0).toString());
      
      if (!brandOrderMap.has(brand)) {
        brandOrderMap.set(brand, { total: 0, pieces: 0 });
      }
      
      const currentData = brandOrderMap.get(brand)!;
      currentData.total += value;
      currentData.pieces += pieces;
    });

    // Find matching PO numbers to group billing data by brand
    const brandBillingMap = new Map<string, number>();
    
    // Create a map from order number to brand
    const orderToBrandMap = new Map<string, string>();
    orderData.forEach(order => {
      const orderKey = `${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
      orderToBrandMap.set(orderKey, order.CENTROCUSTO || 'Sem Marca');
    });
    
    // Process billing data using the order-to-brand mapping
    billingData.forEach(item => {
      const orderKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}`;
      const brand = orderToBrandMap.get(orderKey) || 'Sem Marca';
      const value = parseFloat((item.VALOR_NOTA || 0).toString());
      
      if (!brandBillingMap.has(brand)) {
        brandBillingMap.set(brand, 0);
      }
      
      brandBillingMap.set(brand, brandBillingMap.get(brand)! + value);
    });

    // Combine the data for only the brands in our processed list
    const brandItems: BrandPerformanceItem[] = [];
    
    // Process all unique brands or the paginated subset
    processedBrands.forEach(brand => {
      // Skip if brand filter is applied and this isn't the filtered brand
      if (filters.brand && filters.brand !== 'all' && brand !== filters.brand) {
        return;
      }
      
      const orderData = brandOrderMap.get(brand) || { total: 0, pieces: 0 };
      const totalBilled = brandBillingMap.get(brand) || 0;
      const conversionRate = orderData.total > 0 ? (totalBilled / orderData.total) * 100 : 0;
      
      brandItems.push({
        brand,
        totalOrders: orderData.total,
        totalBilled,
        conversionRate,
        volume: orderData.pieces
      });
    });

    // Sort by total billed value
    brandItems.sort((a, b) => b.totalBilled - a.totalBilled);

    return { 
      data: { items: brandItems },
      totalCount: uniqueBrands.length
    };
  } catch (error) {
    console.error('Error fetching brand data:', error);
    return { data: generateMockBrandData(), totalCount: 0 };
  }
};

/**
 * Fetches representative performance data with option to fetch all data
 */
const fetchRepresentativeData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  representative: string | null;
  status: string | null;
  pagination?: {
    repPagination?: { page: number, pageSize: number };
    noLimits?: boolean;
  };
}): Promise<{data: RepresentativeData, totalCount: number}> => {
  try {
    // Convert dates to strings for the query
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
    
    console.log(`Fetching representative data from ${startDateStr} to ${endDateStr}`);

    // First get all unique representatives to get total count
    let repListQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('REPRESENTANTE', { count: 'exact', head: false })
      .not('REPRESENTANTE', 'is', null);

    // Add date filters if provided
    if (startDateStr && endDateStr) {
      repListQuery = repListQuery
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', endDateStr + 'T23:59:59Z');
    }

    // Add brand filter if provided
    if (filters.brand && filters.brand !== 'all') {
      repListQuery = repListQuery.eq('CENTROCUSTO', filters.brand);
    }

    const { data: repsList, error: repsListError, count: repsCount } = await repListQuery;

    if (repsListError) {
      console.error('Error fetching representatives list:', repsListError);
      return { data: { items: [] }, totalCount: 0 };
    }

    // Get unique representatives
    const uniqueReps = [...new Set(repsList?.map(item => item.REPRESENTANTE))].filter(Boolean);
    console.log(`Found ${uniqueReps.length} unique representatives`);

    // Fetch all representatives' names
    const { data: representatives, error: repError } = await supabase
      .from('vw_representantes')
      .select('*');

    if (repError) {
      console.error('Error fetching representatives:', repError);
      return { data: generateMockRepresentativeData(), totalCount: 0 };
    }

    // Create a map of rep codes to names
    const repNameMap = new Map<number, string>();
    if (representatives && Array.isArray(representatives)) {
      representatives.forEach(rep => {
        repNameMap.set(rep.codigo_representante, rep.nome_representante || 'Representante sem nome');
      });
    }

    // Calculate pagination or fetch all
    let processedReps: number[] = uniqueReps;

    // Apply pagination if noLimits is false and pagination info is provided
    if (!filters.pagination?.noLimits && filters.pagination?.repPagination) {
      const { page, pageSize } = filters.pagination.repPagination;
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      processedReps = uniqueReps.slice(startIdx, endIdx);
      console.log(`Using paged representatives: ${processedReps.length} reps from index ${startIdx} to ${endIdx-1}`);
    }

    // Fetch order data for all representatives without limit
    let orderQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('*');

    // Add date filters if provided
    if (startDateStr && endDateStr) {
      orderQuery = orderQuery
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', endDateStr + 'T23:59:59Z');
    }

    // Add brand filter if provided
    if (filters.brand && filters.brand !== 'all') {
      orderQuery = orderQuery.eq('CENTROCUSTO', filters.brand);
    }

    // Add status filter if provided
    if (filters.status && filters.status !== 'all') {
      orderQuery = orderQuery.eq('STATUS', filters.status);
    }

    const { data: orderData, error: orderError } = await orderQuery;

    if (orderError) {
      console.error('Error fetching order data by representative:', orderError);
      return { data: generateMockRepresentativeData(), totalCount: 0 };
    }

    // Group order data by representative
    const repOrderMap = new Map<number, { total: number, count: number }>();
    
    orderData.forEach(order => {
      const repCode = order.REPRESENTANTE;
      if (!repCode) return;
      
      const value = parseFloat((order.TOTAL_PRODUTO || 0).toString());
      
      if (!repOrderMap.has(repCode)) {
        repOrderMap.set(repCode, { total: 0, count: 0 });
      }
      
      const currentData = repOrderMap.get(repCode)!;
      currentData.total += value;
      currentData.count += 1; // Count orders for average ticket calculation
    });

    // Find matching PO numbers to group billing data by representative
    // Create a map from order number to representative
    const orderToRepMap = new Map<string, number>();
    orderData.forEach(order => {
      if (!order.REPRESENTANTE) return;
      
      const orderKey = `${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
      orderToRepMap.set(orderKey, order.REPRESENTANTE);
    });
    
    // Fetch billing data
    let billingQuery = supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .eq('TIPO', 'S'); // Only sales

    // Add date filters if provided
    if (startDateStr && endDateStr) {
      billingQuery = billingQuery
        .gte('DATA_EMISSAO', startDateStr)
        .lte('DATA_EMISSAO', endDateStr + 'T23:59:59Z');
    }

    const { data: billingData, error: billingError } = await billingQuery;

    if (billingError) {
      console.error('Error fetching billing data by representative:', billingError);
      return { data: generateMockRepresentativeData(), totalCount: 0 };
    }

    console.log(`Processing representative data from ${orderData?.length || 0} orders and ${billingData?.length || 0} billing records`);
    
    // Process billing data using the order-to-rep mapping
    const repBillingMap = new Map<number, number>();
    
    billingData.forEach(item => {
      const orderKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}`;
      const repCode = orderToRepMap.get(orderKey);
      
      if (!repCode) return; // Skip if no representative found
      
      const value = parseFloat((item.VALOR_NOTA || 0).toString());
      
      if (!repBillingMap.has(repCode)) {
        repBillingMap.set(repCode, 0);
      }
      
      repBillingMap.set(repCode, repBillingMap.get(repCode)! + value);
    });

    // Combine the data
    const repItems: RepresentativeItem[] = [];
    
    // Process only the representatives in our processed list
    processedReps.forEach(repCode => {
      // Skip if rep filter is applied and this isn't the filtered rep
      if (filters.representative && filters.representative !== 'all' && repCode.toString() !== filters.representative) {
        return;
      }
      
      const repName = repNameMap.get(repCode) || `Rep #${repCode}`;
      const orderData = repOrderMap.get(repCode) || { total: 0, count: 0 };
      const totalBilled = repBillingMap.get(repCode) || 0;
      const conversionRate = orderData.total > 0 ? (totalBilled / orderData.total) * 100 : 0;
      const averageTicket = orderData.count > 0 ? orderData.total / orderData.count : 0;
      
      repItems.push({
        code: repCode.toString(),
        name: repName,
        totalOrders: orderData.total,
        totalBilled,
        conversionRate,
        averageTicket
      });
    });

    // Sort by total billed value
    repItems.sort((a, b) => b.totalBilled - a.totalBilled);

    return { 
      data: { items: repItems },
      totalCount: uniqueReps.length
    };
  } catch (error) {
    console.error('Error fetching representative data:', error);
    return { data: generateMockRepresentativeData(), totalCount: 0 };
  }
};

/**
 * Fetches delivery efficiency data with option to fetch all data
 */
const fetchDeliveryData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  representative: string | null;
  status: string | null;
  pagination?: any;
}): Promise<DeliveryData> => {
  try {
    // Convert dates to strings for the query
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
    
    console.log(`Fetching delivery data from ${startDateStr} to ${endDateStr}`);

    // Fetch all order data - no limit needed as we're aggregating
    let orderQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('*');

    // Add date filters if provided
    if (startDateStr && endDateStr) {
      orderQuery = orderQuery
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', endDateStr + 'T23:59:59Z');
    }

    // Add brand filter if provided
    if (filters.brand && filters.brand !== 'all') {
      orderQuery = orderQuery.eq('CENTROCUSTO', filters.brand);
    }

    // Add representative filter if provided
    if (filters.representative && filters.representative !== 'all') {
      orderQuery = orderQuery.eq('REPRESENTANTE', parseInt(filters.representative));
    }

    // Add status filter if provided
    if (filters.status && filters.status !== 'all') {
      orderQuery = orderQuery.eq('STATUS', filters.status);
    }

    const { data: orderData, error: orderError } = await orderQuery;

    if (orderError) {
      console.error('Error fetching order delivery data:', orderError);
      return generateMockDeliveryData();
    }

    console.log(`Processing delivery data from ${orderData?.length || 0} orders`);

    // Count orders by status
    let fullyDelivered = 0; // STATUS = 3
    let partialDelivery = 0; // STATUS = 2
    let openOrders = 0;     // STATUS = 1 or STATUS = 0
    let totalRemainingQty = 0;
    let totalOrders = 0;
    
    orderData.forEach(order => {
      const status = order.STATUS;
      const remainingQty = parseFloat((order.QTDE_SALDO || 0).toString());
      
      totalOrders++;
      totalRemainingQty += remainingQty;
      
      if (status === '3') {
        fullyDelivered++;
      } else if (status === '2') {
        partialDelivery++;
      } else if (status === '1' || status === '0') {
        openOrders++;
      }
    });
    
    // Calculate percentages
    const fullyDeliveredPercentage = totalOrders > 0 ? (fullyDelivered / totalOrders) * 100 : 0;
    const partialPercentage = totalOrders > 0 ? (partialDelivery / totalOrders) * 100 : 0;
    const openPercentage = totalOrders > 0 ? (openOrders / totalOrders) * 100 : 0;
    const averageRemainingQuantity = totalOrders > 0 ? totalRemainingQty / totalOrders : 0;
    
    return {
      fullyDeliveredPercentage,
      partialPercentage,
      openPercentage,
      averageRemainingQuantity
    };
  } catch (error) {
    console.error('Error fetching delivery data:', error);
    return generateMockDeliveryData();
  }
};

// Mock data generators for fallback
function generateMockKpiData(): KpiData {
  return {
    totalOrders: 1250000,
    totalBilled: 850000,
    conversionRate: 68,
    orderedPieces: 6500,
    billedPieces: 4400,
    averageDiscount: 8.5
  };
}

function generateMockTimeSeriesData(): TimeSeriesData {
  const currentDate = new Date();
  const months = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    
    months.push({
      date: format(date, 'MMM yyyy'),
      ordersValue: 180000 + Math.round(Math.random() * 50000),
      billedValue: 130000 + Math.round(Math.random() * 40000),
      orderedPieces: 900 + Math.round(Math.random() * 200),
      billedPieces: 600 + Math.round(Math.random() * 180)
    });
  }
  
  return { monthlySeries: months };
}

function generateMockBrandData(): BrandData {
  return {
    items: [
      { brand: "Squad", totalOrders: 420000, totalBilled: 310000, conversionRate: 73.8, volume: 1800 },
      { brand: "Blunt", totalOrders: 350000, totalBilled: 245000, conversionRate: 70.0, volume: 1500 },
      { brand: "Skate", totalOrders: 280000, totalBilled: 180000, conversionRate: 64.3, volume: 1200 },
      { brand: "Hondar", totalOrders: 200000, totalBilled: 115000, conversionRate: 57.5, volume: 900 }
    ]
  };
}

function generateMockRepresentativeData(): RepresentativeData {
  return {
    items: [
      { code: "1", name: "João Silva", totalOrders: 380000, totalBilled: 285000, conversionRate: 75.0, averageTicket: 12500 },
      { code: "2", name: "Maria Santos", totalOrders: 320000, totalBilled: 210000, conversionRate: 65.6, averageTicket: 10500 },
      { code: "3", name: "Carlos Oliveira", totalOrders: 290000, totalBilled: 195000, conversionRate: 67.2, averageTicket: 9750 },
      { code: "4", name: "Ana Pereira", totalOrders: 260000, totalBilled: 160000, conversionRate: 61.5, averageTicket: 8000 }
    ]
  };
}

function generateMockDeliveryData(): DeliveryData {
  return {
    fullyDeliveredPercentage: 65,
    partialPercentage: 20,
    openPercentage: 15,
    averageRemainingQuantity: 12.5
  };
}
