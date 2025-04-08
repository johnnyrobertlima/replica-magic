
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
 * Busca dados do dashboard em lotes para superar limites de consulta
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
      noLimits?: boolean;
    }
  }
) => {
  try {
    console.log("Buscando dados do dashboard com filtros aplicados");
    
    const kpiData = await fetchKpiData(filters);
    const timeSeriesData = await fetchTimeSeriesData(filters);
    const brandResults = await fetchBrandData(filters);
    const representativeResults = await fetchRepresentativeData(filters);
    const deliveryData = await fetchDeliveryData(filters);

    // Registra contagens totais para paginação
    const totalCounts = {
      brands: brandResults.totalCount || 0,
      representatives: representativeResults.totalCount || 0
    };

    return {
      kpiData,
      timeSeriesData,
      brandData: brandResults.data,
      representativeData: representativeResults.data,
      deliveryData,
      totalCounts
    };
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    throw error;
  }
};

/**
 * Busca dados KPI das tabelas de faturamento e pedidos com suporte a lotes
 */
const fetchKpiData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  representative: string | null;
  status: string | null;
}): Promise<KpiData> => {
  try {
    // Converte as datas para strings para a consulta
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';

    console.log(`Buscando dados KPI de ${startDateStr} até ${endDateStr}`);
    
    // Buscar dados de pedidos em lotes para superar o limite de 1000 registros
    let allOrderData: any[] = [];
    let hasMoreOrders = true;
    let orderOffset = 0;
    const batchSize = 10000; // Usar lotes grandes para maximizar eficiência
    
    while (hasMoreOrders) {
      let orderQuery = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .range(orderOffset, orderOffset + batchSize - 1);

      // Adicionar filtros de data, se fornecidos
      if (startDateStr && endDateStr) {
        orderQuery = orderQuery
          .gte('DATA_PEDIDO', startDateStr)
          .lte('DATA_PEDIDO', endDateStr + 'T23:59:59.999Z');
      }

      // Adicionar filtro de marca, se fornecido
      if (filters.brand && filters.brand !== 'all') {
        orderQuery = orderQuery.eq('CENTROCUSTO', filters.brand);
      }

      // Adicionar filtro de representante, se fornecido
      if (filters.representative && filters.representative !== 'all') {
        orderQuery = orderQuery.eq('REPRESENTANTE', parseInt(filters.representative));
      }

      // Adicionar filtro de status, se fornecido
      if (filters.status && filters.status !== 'all') {
        orderQuery = orderQuery.eq('STATUS', filters.status);
      }

      const { data: orderBatch, error: orderError } = await orderQuery;

      if (orderError) {
        console.error('Erro ao buscar lote de dados de pedidos:', orderError);
        break;
      }

      if (!orderBatch || orderBatch.length === 0) {
        hasMoreOrders = false;
      } else {
        allOrderData = [...allOrderData, ...orderBatch];
        orderOffset += batchSize;
        hasMoreOrders = orderBatch.length === batchSize;
      }
    }

    console.log(`Total de registros de pedidos recuperados: ${allOrderData.length}`);

    // Buscar dados de faturamento em lotes
    let allBillingData: any[] = [];
    let hasMoreBilling = true;
    let billingOffset = 0;
    
    while (hasMoreBilling) {
      let billingQuery = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*')
        .eq('TIPO', 'S') // Somente dados de vendas
        .range(billingOffset, billingOffset + batchSize - 1);

      // Adicionar filtros de data para faturamento, se fornecidos
      if (startDateStr && endDateStr) {
        billingQuery = billingQuery
          .gte('DATA_EMISSAO', startDateStr)
          .lte('DATA_EMISSAO', endDateStr + 'T23:59:59.999Z');
      }
      
      // Adicionar filtro de marca indiretamente através da junção com pedidos
      if (filters.brand && filters.brand !== 'all') {
        // Obter todos os IDs de pedidos desta marca
        const { data: brandOrderIds } = await supabase
          .from('BLUEBAY_PEDIDO')
          .select('PED_NUMPEDIDO, PED_ANOBASE')
          .eq('CENTROCUSTO', filters.brand);
          
        if (brandOrderIds && brandOrderIds.length > 0) {
          // Criar arrays de PED_NUMPEDIDO e PED_ANOBASE
          const orderNumbers = brandOrderIds.map(order => order.PED_NUMPEDIDO);
          
          // Filtrar faturamento por estes números de pedido
          billingQuery = billingQuery.in('PED_NUMPEDIDO', orderNumbers);
        }
      }

      const { data: billingBatch, error: billingError } = await billingQuery;

      if (billingError) {
        console.error('Erro ao buscar lote de dados de faturamento:', billingError);
        break;
      }

      if (!billingBatch || billingBatch.length === 0) {
        hasMoreBilling = false;
      } else {
        allBillingData = [...allBillingData, ...billingBatch];
        billingOffset += batchSize;
        hasMoreBilling = billingBatch.length === batchSize;
      }
    }

    console.log(`Total de registros de faturamento recuperados: ${allBillingData.length}`);

    // Processa e sumariza dados
    const totalOrders = allOrderData.reduce((sum, item) => {
      const value = item.TOTAL_PRODUTO || 0;
      return sum + parseFloat(value.toString());
    }, 0);

    const orderedPieces = allOrderData.reduce((sum, item) => {
      const qty = item.QTDE_PEDIDA || 0;
      return sum + parseFloat(qty.toString());
    }, 0);

    // MUDANÇA: Calculando o total faturado usando QUANTIDADE * VALOR_UNITARIO em vez de VALOR_NOTA
    const totalBilled = allBillingData.reduce((sum, item) => {
      const quantidade = parseFloat((item.QUANTIDADE || 0).toString());
      const valorUnitario = parseFloat((item.VALOR_UNITARIO || 0).toString());
      return sum + (quantidade * valorUnitario);
    }, 0);

    const billedPieces = allBillingData.reduce((sum, item) => {
      const qty = item.QUANTIDADE || 0;
      return sum + parseFloat(qty.toString());
    }, 0);

    // Calcular taxa de conversão
    const conversionRate = totalOrders > 0 ? (totalBilled / totalOrders) * 100 : 0;

    // Calcular médio ponderado de desconto
    const totalBeforeDiscount = allBillingData.reduce((sum, item) => {
      const qty = parseFloat((item.QUANTIDADE || 0).toString());
      const unitPrice = parseFloat((item.VALOR_UNITARIO || 0).toString());
      return sum + (qty * unitPrice);
    }, 0);

    const totalDiscount = allBillingData.reduce((sum, item) => {
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
 * com suporte a lotes para superar limites de consulta
 */
const fetchTimeSeriesData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  representative: string | null;
  status: string | null;
}): Promise<TimeSeriesData> => {
  try {
    // Converte datas para strings para a consulta ou usa últimos 6 meses se não fornecidas
    let startDate = filters.startDate;
    let endDate = filters.endDate;
    
    if (!startDate || !endDate) {
      endDate = new Date();
      startDate = subMonths(endDate, 6);
    }
    
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    console.log(`Buscando dados de séries temporais de ${startDateStr} até ${endDateStr}`);

    // Obter dados de pedidos em lotes
    let allOrderData: any[] = [];
    let hasMoreOrders = true;
    let orderOffset = 0;
    const batchSize = 10000;
    
    while (hasMoreOrders) {
      let orderQuery = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', endDateStr + 'T23:59:59.999Z')
        .range(orderOffset, orderOffset + batchSize - 1);

      // Adicionar filtro de marca, se fornecido
      if (filters.brand && filters.brand !== 'all') {
        orderQuery = orderQuery.eq('CENTROCUSTO', filters.brand);
      }

      // Adicionar filtro de representante, se fornecido
      if (filters.representative && filters.representative !== 'all') {
        orderQuery = orderQuery.eq('REPRESENTANTE', parseInt(filters.representative));
      }

      // Adicionar filtro de status, se fornecido
      if (filters.status && filters.status !== 'all') {
        orderQuery = orderQuery.eq('STATUS', filters.status);
      }

      const { data: orderBatch, error: orderError } = await orderQuery;

      if (orderError) {
        console.error('Erro ao buscar lote de dados de pedidos para séries temporais:', orderError);
        break;
      }

      if (!orderBatch || orderBatch.length === 0) {
        hasMoreOrders = false;
      } else {
        allOrderData = [...allOrderData, ...orderBatch];
        orderOffset += batchSize;
        hasMoreOrders = orderBatch.length === batchSize;
      }
    }

    // Obter dados de faturamento em lotes
    let allBillingData: any[] = [];
    let hasMoreBilling = true;
    let billingOffset = 0;
    
    while (hasMoreBilling) {
      let billingQuery = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*')
        .eq('TIPO', 'S') // Somente vendas
        .gte('DATA_EMISSAO', startDateStr)
        .lte('DATA_EMISSAO', endDateStr + 'T23:59:59.999Z')
        .range(billingOffset, billingOffset + batchSize - 1);

      const { data: billingBatch, error: billingError } = await billingQuery;

      if (billingError) {
        console.error('Erro ao buscar lote de dados de faturamento para séries temporais:', billingError);
        break;
      }

      if (!billingBatch || billingBatch.length === 0) {
        hasMoreBilling = false;
      } else {
        allBillingData = [...allBillingData, ...billingBatch];
        billingOffset += batchSize;
        hasMoreBilling = billingBatch.length === batchSize;
      }
    }

    console.log(`Processando dados de séries temporais de ${allOrderData.length} pedidos e ${allBillingData.length} registros de faturamento`);

    // Agrupar dados por mês
    const monthlyData = new Map<string, TimeSeriesPoint>();

    // Processar dados de pedidos
    allOrderData.forEach(order => {
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

    // Processar dados de faturamento
    allBillingData.forEach(item => {
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
      
      // MUDANÇA: Calculando o valor faturado usando QUANTIDADE * VALOR_UNITARIO em vez de VALOR_NOTA
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
 * Busca dados de todas as marcas em lotes se necessário para superar limites de consulta
 * com opção de buscar todos os dados sem limites
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
    // Converte datas para strings para a consulta
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
    
    console.log(`Buscando dados de marcas de ${startDateStr} até ${endDateStr}`);

    // Busca todas as marcas únicas primeiro para obter contagem total
    let allBrandsQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('CENTROCUSTO')
      .not('CENTROCUSTO', 'is', null);

    // Adiciona filtros de data se fornecidos
    if (startDateStr && endDateStr) {
      allBrandsQuery = allBrandsQuery
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', endDateStr + 'T23:59:59.999Z');
    }

    const { data: brandsData, error: brandsError } = await allBrandsQuery;

    if (brandsError) {
      console.error('Erro ao buscar lista de marcas:', brandsError);
      return { data: { items: [] }, totalCount: 0 };
    }

    // Obtém marcas únicas
    const uniqueBrands = [...new Set(brandsData?.map(item => item.CENTROCUSTO))].filter(Boolean);
    console.log(`Encontradas ${uniqueBrands.length} marcas únicas`);

    // Busca dados de pedidos em lotes
    let allOrderData: any[] = [];
    let hasMoreOrders = true;
    let orderOffset = 0;
    const batchSize = 10000;
    
    while (hasMoreOrders) {
      let orderQuery = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .range(orderOffset, orderOffset + batchSize - 1);

      // Adiciona filtros de data se fornecidos
      if (startDateStr && endDateStr) {
        orderQuery = orderQuery
          .gte('DATA_PEDIDO', startDateStr)
          .lte('DATA_PEDIDO', endDateStr + 'T23:59:59.999Z');
      }

      // Adiciona filtro de representante se fornecido
      if (filters.representative && filters.representative !== 'all') {
        orderQuery = orderQuery.eq('REPRESENTANTE', parseInt(filters.representative));
      }

      // Adiciona filtro de status se fornecido
      if (filters.status && filters.status !== 'all') {
        orderQuery = orderQuery.eq('STATUS', filters.status);
      }

      const { data: orderBatch, error: orderError } = await orderQuery;

      if (orderError) {
        console.error('Erro ao buscar lote de dados de pedidos por marca:', orderError);
        break;
      }

      if (!orderBatch || orderBatch.length === 0) {
        hasMoreOrders = false;
      } else {
        allOrderData = [...allOrderData, ...orderBatch];
        orderOffset += batchSize;
        hasMoreOrders = orderBatch.length === batchSize;
      }
    }

    // Busca dados de faturamento em lotes
    let allBillingData: any[] = [];
    let hasMoreBilling = true;
    let billingOffset = 0;
    
    while (hasMoreBilling) {
      let billingQuery = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*')
        .eq('TIPO', 'S') // Somente vendas
        .range(billingOffset, billingOffset + batchSize - 1);

      // Adiciona filtros de data se fornecidos
      if (startDateStr && endDateStr) {
        billingQuery = billingQuery
          .gte('DATA_EMISSAO', startDateStr)
          .lte('DATA_EMISSAO', endDateStr + 'T23:59:59.999Z');
      }

      const { data: billingBatch, error: billingError } = await billingQuery;

      if (billingError) {
        console.error('Erro ao buscar lote de dados de faturamento por marca:', billingError);
        break;
      }

      if (!billingBatch || billingBatch.length === 0) {
        hasMoreBilling = false;
      } else {
        allBillingData = [...allBillingData, ...billingBatch];
        billingOffset += batchSize;
        hasMoreBilling = billingBatch.length === batchSize;
      }
    }

    console.log(`Processando dados de marcas de ${allOrderData.length} pedidos e ${allBillingData.length} registros de faturamento`);

    // Agrupa dados de pedidos por marca
    const brandOrderMap = new Map<string, { total: number, pieces: number }>();
    
    allOrderData.forEach(order => {
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

    // Cria um mapa de número do pedido para marca
    const orderToBrandMap = new Map<string, string>();
    allOrderData.forEach(order => {
      const orderKey = `${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
      orderToBrandMap.set(orderKey, order.CENTROCUSTO || 'Sem Marca');
    });
    
    // MUDANÇA: Calcula o valor faturado usando QUANTIDADE * VALOR_UNITARIO em vez de VALOR_NOTA
    const brandBillingMap = new Map<string, number>();
    
    allBillingData.forEach(item => {
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
 * Busca dados de desempenho de representantes com opção de buscar todos os dados
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
    // Converte datas para strings para a consulta
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
    
    console.log(`Buscando dados de representantes de ${startDateStr} até ${endDateStr}`);

    // Obtém todos os representantes únicos primeiro
    let repListQuery = supabase
      .from('BLUEBAY_PEDIDO')
      .select('REPRESENTANTE')
      .not('REPRESENTANTE', 'is', null);

    // Adiciona filtros de data se fornecidos
    if (startDateStr && endDateStr) {
      repListQuery = repListQuery
        .gte('DATA_PEDIDO', startDateStr)
        .lte('DATA_PEDIDO', endDateStr + 'T23:59:59.999Z');
    }

    // Adiciona filtro de marca se fornecido
    if (filters.brand && filters.brand !== 'all') {
      repListQuery = repListQuery.eq('CENTROCUSTO', filters.brand);
    }

    const { data: repsList, error: repsListError } = await repListQuery;

    if (repsListError) {
      console.error('Erro ao buscar lista de representantes:', repsListError);
      return { data: { items: [] }, totalCount: 0 };
    }

    // Obtém representantes únicos
    const uniqueReps = [...new Set(repsList?.map(item => item.REPRESENTANTE))].filter(Boolean);
    console.log(`Encontrados ${uniqueReps.length} representantes únicos`);

    // Busca nomes de todos os representantes
    const { data: representatives, error: repError } = await supabase
      .from('vw_representantes')
      .select('*');

    if (repError) {
      console.error('Erro ao buscar representantes:', repError);
      return { data: { items: [] }, totalCount: 0 };
    }

    // Cria um mapa de códigos para nomes de representantes
    const repNameMap = new Map<number, string>();
    if (representatives && Array.isArray(representatives)) {
      representatives.forEach(rep => {
        repNameMap.set(rep.codigo_representante, rep.nome_representante || 'Representante sem nome');
      });
    }

    // Busca dados de pedidos em lotes
    let allOrderData: any[] = [];
    let hasMoreOrders = true;
    let orderOffset = 0;
    const batchSize = 10000;
    
    while (hasMoreOrders) {
      let orderQuery = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .range(orderOffset, orderOffset + batchSize - 1);

      // Adiciona filtros de data se fornecidos
      if (startDateStr && endDateStr) {
        orderQuery = orderQuery
          .gte('DATA_PEDIDO', startDateStr)
          .lte('DATA_PEDIDO', endDateStr + 'T23:59:59.999Z');
      }

      // Adiciona filtro de marca se fornecido
      if (filters.brand && filters.brand !== 'all') {
        orderQuery = orderQuery.eq('CENTROCUSTO', filters.brand);
      }

      // Adiciona filtro de status se fornecido
      if (filters.status && filters.status !== 'all') {
        orderQuery = orderQuery.eq('STATUS', filters.status);
      }

      const { data: orderBatch, error: orderError } = await orderQuery;

      if (orderError) {
        console.error('Erro ao buscar lote de dados de pedidos por representante:', orderError);
        break;
      }

      if (!orderBatch || orderBatch.length === 0) {
        hasMoreOrders = false;
      } else {
        allOrderData = [...allOrderData, ...orderBatch];
        orderOffset += batchSize;
        hasMoreOrders = orderBatch.length === batchSize;
      }
    }

    // Agrupa dados de pedidos por representante
    const repOrderMap = new Map<number, { total: number, count: number }>();
    
    allOrderData.forEach(order => {
      const repCode = order.REPRESENTANTE;
      if (!repCode) return;
      
      const value = parseFloat((order.TOTAL_PRODUTO || 0).toString());
      
      if (!repOrderMap.has(repCode)) {
        repOrderMap.set(repCode, { total: 0, count: 0 });
      }
      
      const currentData = repOrderMap.get(repCode)!;
      currentData.total += value;
      currentData.count += 1; // Conta pedidos para cálculo do ticket médio
    });

    // Cria um mapa de número do pedido para representante
    const orderToRepMap = new Map<string, number>();
    allOrderData.forEach(order => {
      if (!order.REPRESENTANTE) return;
      
      const orderKey = `${order.PED_NUMPEDIDO}-${order.PED_ANOBASE}`;
      orderToRepMap.set(orderKey, order.REPRESENTANTE);
    });
    
    // Busca dados de faturamento em lotes
    let allBillingData: any[] = [];
    let hasMoreBilling = true;
    let billingOffset = 0;
    
    while (hasMoreBilling) {
      let billingQuery = supabase
        .from('BLUEBAY_FATURAMENTO')
        .select('*')
        .eq('TIPO', 'S') // Somente vendas
        .range(billingOffset, billingOffset + batchSize - 1);

      // Adiciona filtros de data se fornecidos
      if (startDateStr && endDateStr) {
        billingQuery = billingQuery
          .gte('DATA_EMISSAO', startDateStr)
          .lte('DATA_EMISSAO', endDateStr + 'T23:59:59.999Z');
      }

      const { data: billingBatch, error: billingError } = await billingQuery;

      if (billingError) {
        console.error('Erro ao buscar lote de dados de faturamento por representante:', billingError);
        break;
      }

      if (!billingBatch || billingBatch.length === 0) {
        hasMoreBilling = false;
      } else {
        allBillingData = [...allBillingData, ...billingBatch];
        billingOffset += batchSize;
        hasMoreBilling = billingBatch.length === batchSize;
      }
    }

    console.log(`Processando dados de representantes de ${allOrderData.length} pedidos e ${allBillingData.length} registros de faturamento`);
    
    // MUDANÇA: Calcula o valor faturado usando QUANTIDADE * VALOR_UNITARIO em vez de VALOR_NOTA
    const repBillingMap = new Map<number, number>();
    
    allBillingData.forEach(item => {
      const orderKey = `${item.PED_NUMPEDIDO}-${item.PED_ANOBASE}`;
      const repCode = orderToRepMap.get(orderKey);
      
      if (!repCode) return; // Pula se nenhum representante for encontrado
      
      const quantidade = parseFloat((item.QUANTIDADE || 0).toString());
      const valorUnitario = parseFloat((item.VALOR_UNITARIO || 0).toString());
      const valorFaturado = quantidade * valorUnitario;
      
      if (!repBillingMap.has(repCode)) {
        repBillingMap.set(repCode, 0);
      }
      
      repBillingMap.set(repCode, repBillingMap.get(repCode)! + valorFaturado);
    });

    // Aplica paginação ou busca todos
    let processedReps = uniqueReps;

    // Aplica paginação se noLimits for false e as informações de paginação forem fornecidas
    if (!filters.pagination?.noLimits && filters.pagination?.repPagination) {
      const { page, pageSize } = filters.pagination.repPagination;
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      processedReps = uniqueReps.slice(startIdx, endIdx);
      console.log(`Usando representantes paginados: ${processedReps.length} reps do índice ${startIdx} a ${endIdx-1}`);
    }

    // Combina os dados
    const repItems: RepresentativeItem[] = [];
    
    // Processa apenas os representantes em nossa lista processada
    processedReps.forEach(repCode => {
      // Pula se o filtro de representante for aplicado e este não for o representante filtrado
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

    // Ordena por valor faturado
    repItems.sort((a, b) => b.totalBilled - a.totalBilled);

    return { 
      data: { items: repItems },
      totalCount: uniqueReps.length
    };
  } catch (error) {
    console.error('Erro ao buscar dados de representantes:', error);
    throw error;
  }
};

/**
 * Busca dados de eficiência de entrega com opção de buscar todos os dados
 */
const fetchDeliveryData = async (filters: {
  startDate: Date | null;
  endDate: Date | null;
  brand: string | null;
  representative: string | null;
  status: string | null;
}): Promise<DeliveryData> => {
  try {
    // Converte datas para strings para a consulta
    const startDateStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
    const endDateStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
    
    console.log(`Buscando dados de entrega de ${startDateStr} até ${endDateStr}`);

    // Busca todos os dados de pedidos em lotes
    let allOrderData: any[] = [];
    let hasMoreOrders = true;
    let orderOffset = 0;
    const batchSize = 10000;
    
    while (hasMoreOrders) {
      let orderQuery = supabase
        .from('BLUEBAY_PEDIDO')
        .select('*')
        .range(orderOffset, orderOffset + batchSize - 1);

      // Adiciona filtros de data se fornecidos
      if (startDateStr && endDateStr) {
        orderQuery = orderQuery
          .gte('DATA_PEDIDO', startDateStr)
          .lte('DATA_PEDIDO', endDateStr + 'T23:59:59.999Z');
      }

      // Adiciona filtro de marca se fornecido
      if (filters.brand && filters.brand !== 'all') {
        orderQuery = orderQuery.eq('CENTROCUSTO', filters.brand);
      }

      // Adiciona filtro de representante se fornecido
      if (filters.representative && filters.representative !== 'all') {
        orderQuery = orderQuery.eq('REPRESENTANTE', parseInt(filters.representative));
      }

      // Adiciona filtro de status se fornecido
      if (filters.status && filters.status !== 'all') {
        orderQuery = orderQuery.eq('STATUS', filters.status);
      }

      const { data: orderBatch, error: orderError } = await orderQuery;

      if (orderError) {
        console.error('Erro ao buscar lote de dados de entrega:', orderError);
        break;
      }

      if (!orderBatch || orderBatch.length === 0) {
        hasMoreOrders = false;
      } else {
        allOrderData = [...allOrderData, ...orderBatch];
        orderOffset += batchSize;
        hasMoreOrders = orderBatch.length === batchSize;
      }
    }

    console.log(`Processando dados de entrega de ${allOrderData.length} pedidos`);

    // Conta pedidos por status
    let fullyDelivered = 0; // STATUS = 3
    let partialDelivery = 0; // STATUS = 2
    let openOrders = 0;     // STATUS = 1 ou STATUS = 0
    let totalRemainingQty = 0;
    let totalOrders = 0;
    
    allOrderData.forEach(order => {
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
    
    // Calcula percentuais
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
    console.error('Erro ao buscar dados de entrega:', error);
    throw error;
  }
};

// Geradores de dados simulados para fallback
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
