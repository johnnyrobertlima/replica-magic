
import { supabase } from "@/integrations/supabase/client";
import { 
  KpiData, 
  TimeSeriesData, 
  TimeSeriesPoint, 
  BrandData, 
  BrandPerformanceItem,
  DeliveryData,
  DashboardFilterParams
} from "@/types/bluebay/dashboardTypes";
import { format, subMonths, parseISO } from 'date-fns';

/**
 * Busca dados do dashboard em lotes para superar limites de consulta
 */
export const fetchDashboardData = async (
  filters: {
    startDate: Date | null;
    endDate: Date | null;
    brand: string | null;
    status: string | null;
    pagination?: {
      brandPagination?: { page: number, pageSize: number };
      noLimits?: boolean;
    }
  }
) => {
  try {
    console.log("Buscando dados do dashboard com filtros aplicados:", JSON.stringify({
      startDate: filters.startDate,
      endDate: filters.endDate,
      brand: filters.brand,
      status: filters.status
    }, null, 2));
    
    const kpiData = await fetchKpiData(filters);
    const timeSeriesData = await fetchTimeSeriesData(filters);
    const brandResults = await fetchBrandData(filters);
    const deliveryData = await fetchDeliveryData(filters);

    // Registra contagens totais para paginação
    const totalCounts = {
      brands: brandResults.totalCount || 0
    };

    return {
      kpiData,
      timeSeriesData,
      brandData: brandResults.data,
      deliveryData,
      totalCounts
    };
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    throw error;
  }
};

/**
 * Busca dados KPI das tabelas de faturamento e pedidos
 * Reformulado para usar cálculos corretos e filtros apropriados
 */
const fetchKpiData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  status: string | null;
}): Promise<KpiData> => {
  try {
    // Converte as datas para strings no formato SQL
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';

    console.log(`Buscando dados KPI de ${startDateStr} até ${endDateStr}`);
    
    // Define os status válidos para filtrar
    const validStatuses = ['0', '1', '2', '3'];
    const statusFilter = filters.status && filters.status !== 'all' 
      ? [filters.status]
      : validStatuses;
    
    // Buscar dados de pedidos com os filtros aplicados diretamente na query
    const { data: orderData, error: orderError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .in('STATUS', statusFilter)
      .gte('DATA_PEDIDO', startDateStr)
      .lte('DATA_PEDIDO', `${endDateStr}T23:59:59`)
      .not('DATA_PEDIDO', 'is', null);
    
    if (orderError) {
      console.error('Erro ao buscar dados de pedidos:', orderError);
      throw orderError;
    }
    
    console.log(`Total de registros de pedidos recuperados: ${orderData?.length || 0}`);

    // Aplicar filtro de marca, se fornecido
    const brandFilteredOrders = filters.brand && filters.brand !== 'all'
      ? orderData?.filter(order => order.CENTROCUSTO === filters.brand)
      : orderData;

    // Buscar dados de faturamento com filtros aplicados diretamente na query
    const { data: billingData, error: billingError } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .eq('TIPO', 'S') // Somente dados de vendas
      .gte('DATA_EMISSAO', startDateStr)
      .lte('DATA_EMISSAO', `${endDateStr}T23:59:59`);
    
    if (billingError) {
      console.error('Erro ao buscar dados de faturamento:', billingError);
      throw billingError;
    }
    
    console.log(`Total de registros de faturamento recuperados: ${billingData?.length || 0}`);

    // Aplicar filtro de marca via join com pedidos
    const brandFilteredBilling = filters.brand && filters.brand !== 'all'
      ? billingData?.filter(billing => {
          // Para encontrar faturamentos da marca específica, usamos o código do pedido
          const pedido = orderData?.find(order => 
            order.PED_NUMPEDIDO === billing.PED_NUMPEDIDO && 
            order.PED_ANOBASE === billing.PED_ANOBASE &&
            order.CENTROCUSTO === filters.brand
          );
          return !!pedido;
        })
      : billingData;

    // Processa e sumariza dados - usando cálculo correto (QTDE * VALOR_UNITARIO)
    const totalOrders = (brandFilteredOrders || []).reduce((sum, item) => {
      const value = (item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0);
      return sum + parseFloat(value.toString());
    }, 0);

    const orderedPieces = (brandFilteredOrders || []).reduce((sum, item) => {
      const qty = item.QTDE_PEDIDA || 0;
      return sum + parseFloat(qty.toString());
    }, 0);

    // Calculando o total faturado usando QUANTIDADE * VALOR_UNITARIO
    const totalBilled = (brandFilteredBilling || []).reduce((sum, item) => {
      const quantidade = parseFloat((item.QUANTIDADE || 0).toString());
      const valorUnitario = parseFloat((item.VALOR_UNITARIO || 0).toString());
      return sum + (quantidade * valorUnitario);
    }, 0);

    const billedPieces = (brandFilteredBilling || []).reduce((sum, item) => {
      const qty = item.QUANTIDADE || 0;
      return sum + parseFloat(qty.toString());
    }, 0);

    // Calcular taxa de conversão
    const conversionRate = totalOrders > 0 ? (totalBilled / totalOrders) * 100 : 0;

    // Calcular médio ponderado de desconto
    const totalBeforeDiscount = (brandFilteredBilling || []).reduce((sum, item) => {
      const qty = parseFloat((item.QUANTIDADE || 0).toString());
      const unitPrice = parseFloat((item.VALOR_UNITARIO || 0).toString());
      return sum + (qty * unitPrice);
    }, 0);

    const totalDiscount = (brandFilteredBilling || []).reduce((sum, item) => {
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
    console.error('Erro ao calcular dados KPI:', error);
    throw error;
  }
};

/**
 * Busca dados de séries temporais para o dashboard
 * Reformulado para usar filtros corretos e agrupamento por mês
 */
const fetchTimeSeriesData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  status: string | null;
}): Promise<TimeSeriesData> => {
  try {
    // Converte datas para strings para a consulta
    let startDate = filters.startDate;
    let endDate = filters.endDate;
    
    if (!startDate || !endDate) {
      endDate = new Date();
      startDate = subMonths(endDate, 6);
    }
    
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    console.log(`Buscando dados de séries temporais de ${startDateStr} até ${endDateStr}`);

    // Define os status válidos para filtrar
    const validStatuses = ['0', '1', '2', '3'];
    const statusFilter = filters.status && filters.status !== 'all' 
      ? [filters.status]
      : validStatuses;
    
    // Obter dados de pedidos com filtros aplicados diretamente na query
    const { data: orderData, error: orderError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .in('STATUS', statusFilter)
      .gte('DATA_PEDIDO', startDateStr)
      .lte('DATA_PEDIDO', `${endDateStr}T23:59:59`)
      .not('DATA_PEDIDO', 'is', null);

    if (orderError) {
      console.error('Erro ao buscar dados de pedidos para séries temporais:', orderError);
      throw orderError;
    }

    // Aplicar filtro de marca, se fornecido
    const brandFilteredOrders = filters.brand && filters.brand !== 'all'
      ? orderData?.filter(order => order.CENTROCUSTO === filters.brand)
      : orderData;

    // Obter dados de faturamento com filtros aplicados diretamente na query
    const { data: billingData, error: billingError } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .eq('TIPO', 'S') // Somente vendas
      .gte('DATA_EMISSAO', startDateStr)
      .lte('DATA_EMISSAO', `${endDateStr}T23:59:59`);

    if (billingError) {
      console.error('Erro ao buscar dados de faturamento para séries temporais:', billingError);
      throw billingError;
    }

    // Aplicar filtro de marca via join com pedidos
    const brandFilteredBilling = filters.brand && filters.brand !== 'all'
      ? billingData?.filter(billing => {
          // Para encontrar faturamentos da marca específica, usamos o código do pedido
          const pedido = orderData?.find(order => 
            order.PED_NUMPEDIDO === billing.PED_NUMPEDIDO && 
            order.PED_ANOBASE === billing.PED_ANOBASE &&
            order.CENTROCUSTO === filters.brand
          );
          return !!pedido;
        })
      : billingData;

    console.log(`Processando dados de séries temporais de ${brandFilteredOrders?.length || 0} pedidos e ${brandFilteredBilling?.length || 0} registros de faturamento`);

    // Agrupar dados por mês
    const monthlyData = new Map<string, TimeSeriesPoint>();

    // Processar dados de pedidos
    (brandFilteredOrders || []).forEach(order => {
      if (!order.DATA_PEDIDO) return;
      
      const orderDate = typeof order.DATA_PEDIDO === 'string' ? parseISO(order.DATA_PEDIDO) : new Date(order.DATA_PEDIDO);
      const monthKey = format(orderDate, 'yyyy-MM');
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          date: monthKey,
          ordersValue: 0,
          billedValue: 0,
          orderedPieces: 0,
          billedPieces: 0
        });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      // Cálculo correto usando QTDE_PEDIDA * VALOR_UNITARIO
      const orderValue = (order.QTDE_PEDIDA || 0) * (order.VALOR_UNITARIO || 0);
      monthData.ordersValue += parseFloat(orderValue.toString());
      monthData.orderedPieces += parseFloat((order.QTDE_PEDIDA || 0).toString());
    });

    // Processar dados de faturamento
    (brandFilteredBilling || []).forEach(item => {
      if (!item.DATA_EMISSAO) return;
      
      const billingDate = typeof item.DATA_EMISSAO === 'string' ? parseISO(item.DATA_EMISSAO) : new Date(item.DATA_EMISSAO);
      const monthKey = format(billingDate, 'yyyy-MM');
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          date: monthKey,
          ordersValue: 0,
          billedValue: 0,
          orderedPieces: 0,
          billedPieces: 0
        });
      }
      
      const monthData = monthlyData.get(monthKey)!;
      
      // Cálculo correto usando QUANTIDADE * VALOR_UNITARIO
      const quantidade = parseFloat((item.QUANTIDADE || 0).toString());
      const valorUnitario = parseFloat((item.VALOR_UNITARIO || 0).toString());
      monthData.billedValue += quantidade * valorUnitario;
      
      monthData.billedPieces += parseFloat((item.QUANTIDADE || 0).toString());
    });

    // Converter mapa para array e ordenar por data
    const monthlySeries = Array.from(monthlyData.values())
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });

    return { monthlySeries };
  } catch (error) {
    console.error('Erro ao buscar dados de séries temporais:', error);
    throw error;
  }
};

/**
 * Busca dados de todas as marcas (CENTROCUSTO)
 * Reformulado para usar filtros corretos
 */
const fetchBrandData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  status: string | null;
  pagination?: {
    brandPagination?: { page: number, pageSize: number };
    noLimits?: boolean;
  };
}): Promise<{data: BrandData, totalCount: number}> => {
  try {
    // Converte datas para strings para a consulta
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
    
    console.log(`Buscando dados de marcas de ${startDateStr} até ${endDateStr}`);

    // Define os status válidos para filtrar
    const validStatuses = ['0', '1', '2', '3'];
    const statusFilter = filters.status && filters.status !== 'all' 
      ? [filters.status]
      : validStatuses;
    
    // Busca todos os pedidos com filtros aplicados diretamente na query
    const { data: orderData, error: orderError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .in('STATUS', statusFilter)
      .gte('DATA_PEDIDO', startDateStr)
      .lte('DATA_PEDIDO', `${endDateStr}T23:59:59`)
      .not('CENTROCUSTO', 'is', null)
      .not('DATA_PEDIDO', 'is', null);

    if (orderError) {
      console.error('Erro ao buscar dados de pedidos por marca:', orderError);
      return { data: { items: [] }, totalCount: 0 };
    }
    
    // Obtém marcas únicas
    const uniqueBrands = [...new Set(orderData?.map(item => item.CENTROCUSTO))].filter(Boolean);
    console.log(`Encontradas ${uniqueBrands.length} marcas únicas:`, uniqueBrands);

    // Busca dados de faturamento com filtros aplicados diretamente na query
    const { data: billingData, error: billingError } = await supabase
      .from('BLUEBAY_FATURAMENTO')
      .select('*')
      .eq('TIPO', 'S') // Somente vendas
      .gte('DATA_EMISSAO', startDateStr)
      .lte('DATA_EMISSAO', `${endDateStr}T23:59:59`);

    if (billingError) {
      console.error('Erro ao buscar dados de faturamento por marca:', billingError);
      return { data: { items: [] }, totalCount: 0 };
    }

    console.log(`Processando dados de marcas de ${orderData?.length || 0} pedidos e ${billingData?.length || 0} registros de faturamento`);

    // Agrupa dados de pedidos por marca usando o cálculo correto (QTDE_PEDIDA * VALOR_UNITARIO)
    const brandOrderMap = new Map<string, { total: number, pieces: number }>();
    
    (orderData || []).forEach(order => {
      const brand = order.CENTROCUSTO || 'Sem Marca';
      const value = (order.QTDE_PEDIDA || 0) * (order.VALOR_UNITARIO || 0);
      const pieces = parseFloat((order.QTDE_PEDIDA || 0).toString());
      
      if (!brandOrderMap.has(brand)) {
        brandOrderMap.set(brand, { total: 0, pieces: 0 });
      }
      
      const currentData = brandOrderMap.get(brand)!;
      currentData.total += value;
      currentData.pieces += pieces;
    });

    // Cria um mapa de número do pedido para marca
    const orderToBrandMap = new Map<string, string>();
    (orderData || []).forEach(order => {
      const orderKey = `${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
      orderToBrandMap.set(orderKey, order.CENTROCUSTO || 'Sem Marca');
    });
    
    // Calcula o valor faturado usando QUANTIDADE * VALOR_UNITARIO
    const brandBillingMap = new Map<string, number>();
    
    (billingData || []).forEach(item => {
      const orderKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}`;
      const brand = orderToBrandMap.get(orderKey) || 'Sem Marca';
      const quantidade = parseFloat((item.QUANTIDADE || 0).toString());
      const valorUnitario = parseFloat((item.VALOR_UNITARIO || 0).toString());
      const valorFaturado = quantidade * valorUnitario;
      
      if (!brandBillingMap.has(brand)) {
        brandBillingMap.set(brand, 0);
      }
      
      brandBillingMap.set(brand, brandBillingMap.get(brand)! + valorFaturado);
    });

    // Combina os dados para todas as marcas únicas
    const brandItems: BrandPerformanceItem[] = [];
    
    // Processa todas as marcas únicas
    uniqueBrands.forEach(brand => {
      // Pula se o filtro de marca for aplicado e não for esta marca
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

    // Ordena por valor faturado
    brandItems.sort((a, b) => b.totalBilled - a.totalBilled);

    // Pagina os resultados se requerido
    let paginatedItems = brandItems;
    if (!filters.pagination?.noLimits && filters.pagination?.brandPagination) {
      const { page, pageSize } = filters.pagination.brandPagination;
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      paginatedItems = brandItems.slice(startIdx, endIdx);
    }

    return { 
      data: { items: paginatedItems },
      totalCount: uniqueBrands.length
    };
  } catch (error) {
    console.error('Erro ao buscar dados de marcas:', error);
    throw error;
  }
};

/**
 * Busca dados de eficiência de entrega
 * Reformulado para usar filtros corretos
 */
const fetchDeliveryData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  status: string | null;
}): Promise<DeliveryData> => {
  try {
    // Converte datas para strings para a consulta
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
    
    console.log(`Buscando dados de eficiência de entrega de ${startDateStr} até ${endDateStr}`);

    // Define os status válidos para filtrar
    const validStatuses = ['0', '1', '2', '3'];
    const statusFilter = filters.status && filters.status !== 'all' 
      ? [filters.status]
      : validStatuses;
    
    // Busca dados de pedidos com filtros aplicados diretamente na query
    const { data: orderData, error: orderError } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .in('STATUS', statusFilter)
      .gte('DATA_PEDIDO', startDateStr)
      .lte('DATA_PEDIDO', `${endDateStr}T23:59:59`)
      .not('DATA_PEDIDO', 'is', null);

    if (orderError) {
      console.error('Erro ao buscar dados de pedidos para eficiência de entrega:', orderError);
      throw orderError;
    }

    // Aplicar filtro de marca, se fornecido
    const brandFilteredOrders = filters.brand && filters.brand !== 'all'
      ? orderData?.filter(order => order.CENTROCUSTO === filters.brand)
      : orderData;

    console.log(`Processando ${brandFilteredOrders?.length || 0} pedidos para análise de eficiência de entrega`);

    // Contadores para análise
    let totalFullyDelivered = 0;
    let totalPartialDelivered = 0;
    let totalOpen = 0;
    let totalItems = 0;
    let totalRemainingQuantity = 0;

    // Analisa cada pedido
    (brandFilteredOrders || []).forEach(order => {
      // Obtém quantidades
      const qtdePedida = parseFloat((order.QTDE_PEDIDA || 0).toString());
      const qtdeEntregue = parseFloat((order.QTDE_ENTREGUE || 0).toString());
      const qtdeSaldo = parseFloat((order.QTDE_SALDO || 0).toString());
      
      // Incrementa contador total
      totalItems++;
      
      // Acumula quantidade pendente
      totalRemainingQuantity += qtdeSaldo;
      
      // Classifica o item
      if (qtdeSaldo === 0 && qtdeEntregue > 0) {
        // Totalmente entregue
        totalFullyDelivered++;
      } else if (qtdeEntregue > 0 && qtdeSaldo > 0) {
        // Parcialmente entregue
        totalPartialDelivered++;
      } else if (qtdeSaldo > 0 && qtdeEntregue === 0) {
        // Totalmente em aberto
        totalOpen++;
      }
    });

    // Calcula percentuais
    const fullyDeliveredPercentage = totalItems > 0 ? (totalFullyDelivered / totalItems) * 100 : 0;
    const partialPercentage = totalItems > 0 ? (totalPartialDelivered / totalItems) * 100 : 0;
    const openPercentage = totalItems > 0 ? (totalOpen / totalItems) * 100 : 0;
    const averageRemainingQuantity = totalItems > 0 ? totalRemainingQuantity / totalItems : 0;

    return {
      fullyDeliveredPercentage,
      partialPercentage,
      openPercentage,
      averageRemainingQuantity
    };
  } catch (error) {
    console.error('Erro ao buscar dados de eficiência de entrega:', error);
    throw error;
  }
};
