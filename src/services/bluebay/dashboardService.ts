
import { supabase } from "@/integrations/supabase/client";
import { DashboardFilterParams } from "@/types/bluebay/dashboardTypes";

export const fetchBluebayDashboardData = async (params: DashboardFilterParams) => {
  try {
    console.log("Fetching dashboard data with params:", params);
    
    // Fetch pedidos (orders)
    const pedidosQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('*');
      
    // Apply filters to pedidos query
    if (params.startDate) {
      pedidosQuery.gte('DATA_PEDIDO', params.startDate);
    }
    if (params.endDate) {
      pedidosQuery.lte('DATA_PEDIDO', `${params.endDate} 23:59:59`);
    }
    if (params.brand) {
      pedidosQuery.eq('CENTROCUSTO', params.brand);
    }
    if (params.representative) {
      // Ensure representative is compared as string
      pedidosQuery.eq('REPRESENTANTE', params.representative);
    }
    if (params.status) {
      pedidosQuery.eq('STATUS', params.status);
    }
    
    // Fetch faturamento (billing)
    const faturamentoQuery = supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .eq('TIPO', 'S');
      
    // Apply filters to faturamento query
    if (params.startDate) {
      faturamentoQuery.gte('DATA_EMISSAO', params.startDate);
    }
    if (params.endDate) {
      faturamentoQuery.lte('DATA_EMISSAO', `${params.endDate} 23:59:59`);
    }
    
    // Execute the queries in parallel
    const [pedidosResult, faturamentoResult] = await Promise.all([
      pedidosQuery,
      faturamentoQuery
    ]);
    
    if (pedidosResult.error) {
      throw new Error(`Error fetching orders: ${pedidosResult.error.message}`);
    }
    
    if (faturamentoResult.error) {
      throw new Error(`Error fetching billing: ${faturamentoResult.error.message}`);
    }
    
    const pedidos = pedidosResult.data || [];
    const faturamento = faturamentoResult.data || [];

    // Filter faturamento to match filtered pedidos
    const filteredFaturamento = filterFaturamento(faturamento, pedidos, params);
    
    // Process the data and return the dashboard data
    return processDashboardData(pedidos, filteredFaturamento);
    
  } catch (error) {
    console.error("Error in fetchBluebayDashboardData:", error);
    throw error;
  }
};

// Helper function to filter faturamento based on pedidos
const filterFaturamento = (faturamento, pedidos, params) => {
  // Create a set for O(1) lookup of pedidos keys
  const pedidosKeys = new Set();
  
  pedidos.forEach(pedido => {
    const key = `${pedido.PED_NUMPEDIDO}-${pedido.PED_ANOBASE}-${pedido.MPED_NUMORDEM}-${pedido.ITEM_CODIGO}`;
    pedidosKeys.add(key);
  });
  
  // Filter faturamento to only include entries that match our filtered pedidos
  return faturamento.filter(fat => {
    if (params.brand && fat.CENTROCUSTO && fat.CENTROCUSTO !== params.brand) return false;
    if (params.representative && fat.REPRESENTANTE && fat.REPRESENTANTE.toString() !== params.representative) return false;
    
    const key = `${fat.PED_NUMPEDIDO}-${fat.PED_ANOBASE}-${fat.MPED_NUMORDEM}-${fat.ITEM_CODIGO}`;
    return pedidosKeys.has(key);
  });
};

// Process the data for the dashboard
const processDashboardData = (pedidos, faturamento) => {
  // Calculate KPI data
  const kpi = calculateKpiData(pedidos, faturamento);
  
  // Generate time series data
  const timeSeries = generateTimeSeriesData(pedidos, faturamento);
  
  // Generate brand performance data
  const brands = generateBrandData(pedidos, faturamento);
  
  // Generate representative data
  const representatives = generateRepresentativeData(pedidos, faturamento);
  
  // Generate delivery efficiency data
  const delivery = calculateDeliveryData(pedidos);
  
  return {
    kpi,
    timeSeries,
    brands,
    representatives,
    delivery
  };
};

// Calculate KPI data
const calculateKpiData = (pedidos, faturamento) => {
  // Calculate KPI metrics
  const totalOrders = pedidos.reduce((sum, p) => sum + (p.TOTAL_PRODUTO || 0), 0);
  const totalBilled = faturamento.reduce((sum, f) => sum + (f.VALOR_NOTA || 0), 0);
  const conversionRate = totalOrders > 0 ? (totalBilled / totalOrders) * 100 : 0;
  const orderedPieces = pedidos.reduce((sum, p) => sum + (p.QTDE_PEDIDA || 0), 0);
  const billedPieces = faturamento.reduce((sum, f) => sum + (f.QUANTIDADE || 0), 0);
  
  // Calculate average discount
  let totalDiscount = 0;
  let totalValue = 0;
  
  faturamento.forEach(f => {
    totalDiscount += (f.VALOR_DESCONTO || 0);
    totalValue += (f.VALOR_UNITARIO * f.QUANTIDADE) || 0;
  });
  
  const averageDiscount = totalValue > 0 ? (totalDiscount / totalValue) * 100 : 0;
  
  return {
    totalOrders,
    totalBilled,
    conversionRate,
    orderedPieces,
    billedPieces,
    averageDiscount
  };
};

// Generate time series data
const generateTimeSeriesData = (pedidos, faturamento) => {
  const monthlyData = new Map();
  
  // Process pedidos
  pedidos.forEach(p => {
    if (!p.DATA_PEDIDO) return;
    
    const date = new Date(p.DATA_PEDIDO);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData.has(yearMonth)) {
      monthlyData.set(yearMonth, {
        date: yearMonth,
        ordersValue: 0,
        billedValue: 0,
        orderedPieces: 0,
        billedPieces: 0
      });
    }
    
    const entry = monthlyData.get(yearMonth);
    entry.ordersValue += p.TOTAL_PRODUTO || 0;
    entry.orderedPieces += p.QTDE_PEDIDA || 0;
  });
  
  // Process faturamento
  faturamento.forEach(f => {
    if (!f.DATA_EMISSAO) return;
    
    const date = new Date(f.DATA_EMISSAO);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData.has(yearMonth)) {
      monthlyData.set(yearMonth, {
        date: yearMonth,
        ordersValue: 0,
        billedValue: 0,
        orderedPieces: 0,
        billedPieces: 0
      });
    }
    
    const entry = monthlyData.get(yearMonth);
    entry.billedValue += f.VALOR_NOTA || 0;
    entry.billedPieces += f.QUANTIDADE || 0;
  });
  
  // Convert to array and sort by date
  const monthlySeries = Array.from(monthlyData.values()).sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    monthlySeries
  };
};

// Generate brand performance data
const generateBrandData = (pedidos, faturamento) => {
  const brandMap = new Map();
  
  // Aggregate by brand (CENTROCUSTO)
  pedidos.forEach(p => {
    const brand = p.CENTROCUSTO || 'Unknown';
    
    if (!brandMap.has(brand)) {
      brandMap.set(brand, {
        brand,
        totalOrders: 0,
        totalBilled: 0,
        volume: 0,
        billedVolume: 0
      });
    }
    
    const entry = brandMap.get(brand);
    entry.totalOrders += p.TOTAL_PRODUTO || 0;
    entry.volume += p.QTDE_PEDIDA || 0;
  });
  
  // Add billing data
  faturamento.forEach(f => {
    const brand = f.CENTROCUSTO || 'Unknown';
    
    if (!brandMap.has(brand)) {
      brandMap.set(brand, {
        brand,
        totalOrders: 0,
        totalBilled: 0,
        volume: 0,
        billedVolume: 0
      });
    }
    
    const entry = brandMap.get(brand);
    entry.totalBilled += f.VALOR_NOTA || 0;
    entry.billedVolume += f.QUANTIDADE || 0;
  });
  
  // Calculate conversion rates and prepare final data
  const items = Array.from(brandMap.values()).map(b => ({
    brand: b.brand,
    totalOrders: b.totalOrders,
    totalBilled: b.totalBilled,
    conversionRate: b.totalOrders > 0 ? (b.totalBilled / b.totalOrders) * 100 : 0,
    volume: b.volume
  }));
  
  return { items };
};

// Generate representative data
const generateRepresentativeData = (pedidos, faturamento) => {
  const repMap = new Map();
  
  // Get unique representatives from pedidos
  pedidos.forEach(p => {
    if (!p.REPRESENTANTE) return;
    
    const repCode = p.REPRESENTANTE.toString();
    
    if (!repMap.has(repCode)) {
      repMap.set(repCode, {
        code: repCode,
        name: `Representante ${repCode}`, // This would be replaced with actual names from a lookup
        totalOrders: 0,
        totalBilled: 0,
        orderCount: 0,
      });
    }
    
    const entry = repMap.get(repCode);
    entry.totalOrders += p.TOTAL_PRODUTO || 0;
    entry.orderCount += 1;
  });
  
  // Add billing data
  faturamento.forEach(f => {
    if (!f.REPRESENTANTE) return;
    
    const repCode = f.REPRESENTANTE.toString();
    
    if (!repMap.has(repCode)) return;
    
    const entry = repMap.get(repCode);
    entry.totalBilled += f.VALOR_NOTA || 0;
  });
  
  // Calculate derived metrics and prepare final data
  const items = Array.from(repMap.values()).map(r => ({
    code: r.code,
    name: r.name,
    totalOrders: r.totalOrders,
    totalBilled: r.totalBilled,
    conversionRate: r.totalOrders > 0 ? (r.totalBilled / r.totalOrders) * 100 : 0,
    averageTicket: r.orderCount > 0 ? r.totalOrders / r.orderCount : 0
  }));
  
  // Sort by totalBilled (highest first)
  items.sort((a, b) => b.totalBilled - a.totalBilled);
  
  return { items };
};

// Calculate delivery efficiency data
const calculateDeliveryData = (pedidos) => {
  const total = pedidos.length;
  if (total === 0) {
    return {
      fullyDeliveredPercentage: 0,
      partialPercentage: 0,
      openPercentage: 0,
      averageRemainingQuantity: 0
    };
  }
  
  // Count pedidos by status
  const statusCounts = {
    '0': 0, // Not sure what 0 represents
    '1': 0, // Open
    '2': 0, // Partial
    '3': 0, // Fully delivered
    '4': 0  // Not sure what 4 represents
  };
  
  // Calculate total QTDE_SALDO
  let totalSaldo = 0;
  
  pedidos.forEach(p => {
    const status = p.STATUS || '0';
    if (statusCounts[status] !== undefined) {
      statusCounts[status]++;
    }
    
    totalSaldo += p.QTDE_SALDO || 0;
  });
  
  // Calculate percentages
  const fullyDeliveredPercentage = (statusCounts['3'] / total) * 100;
  const partialPercentage = (statusCounts['2'] / total) * 100;
  const openPercentage = (statusCounts['1'] / total) * 100;
  
  // Calculate average remaining quantity
  const averageRemainingQuantity = total > 0 ? totalSaldo / total : 0;
  
  return {
    fullyDeliveredPercentage,
    partialPercentage,
    openPercentage,
    averageRemainingQuantity
  };
};

export const fetchFilterOptions = async () => {
  try {
    // Fetch brands (CENTROCUSTO) - avoid using distinct
    const { data: brandsData, error: brandsError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('CENTROCUSTO')
      .not('CENTROCUSTO', 'is', null)
      .order('CENTROCUSTO');
    
    if (brandsError) {
      throw new Error(`Error fetching brands: ${brandsError.message}`);
    }

    // Get unique brands manually
    const brandSet = new Set(brandsData.map(b => b.CENTROCUSTO));
    const brands = Array.from(brandSet).map(brand => ({
      value: brand,
      label: brand
    }));

    // Fetch representatives - avoid using distinct
    const { data: repsData, error: repsError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('REPRESENTANTE')
      .not('REPRESENTANTE', 'is', null)
      .order('REPRESENTANTE');
    
    if (repsError) {
      throw new Error(`Error fetching representatives: ${repsError.message}`);
    }

    // Get unique representatives manually
    const repSet = new Set(repsData.map(r => r.REPRESENTANTE));
    const representatives = Array.from(repSet).map(rep => ({
      value: rep.toString(),
      label: `Representante ${rep}`
    }));

    // Get unique status values - avoid using distinct
    const { data: statusesData, error: statusesError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('STATUS')
      .not('STATUS', 'is', null)
      .order('STATUS');
    
    if (statusesError) {
      throw new Error(`Error fetching statuses: ${statusesError.message}`);
    }

    // Get unique statuses manually
    const statusSet = new Set(statusesData.map(s => s.STATUS));
    const statuses = Array.from(statusSet).map(status => {
      let label = "Desconhecido";
      switch (status) {
        case "0": label = "Em Digitação"; break;
        case "1": label = "Em Aberto"; break;
        case "2": label = "Atendido Parcialmente"; break;
        case "3": label = "Totalmente Atendido"; break;
        case "4": label = "Cancelado"; break;
      }
      return { value: status, label };
    });

    return { brands, representatives, statuses };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    throw error;
  }
};
