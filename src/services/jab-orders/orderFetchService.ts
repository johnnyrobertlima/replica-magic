import { supabase } from "@/integrations/supabase/client";
import { UseJabOrdersOptions } from "@/types/jabOrders";
import { clientCodeToString } from "@/utils/client-orders/clientUtils";

export const fetchOrdersForClients = async (clientIds: Array<string | number>, fromDate: string, toDate: string) => {
  try {
    const clientIdsStrings = clientIds.map(clientCodeToString);
    
    const { data, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*, items:BLUEBAY_ITEMPEDIDO(*)')
      .in('PES_CODIGO', clientIdsStrings)
      .gte('DATAPED', fromDate)
      .lte('DATAPED', toDate);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return { success: false, error };
  }
};

export const fetchJabOrders = async (options: UseJabOrdersOptions) => {
  const fromDate = options.dateRange?.from?.toISOString() || '';
  const toDate = options.dateRange?.to?.toISOString() || '';
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const offset = (page - 1) * pageSize;

  try {
    const { data: orders, error } = await supabase
      .rpc('get_pedidos_unicos', {
        data_inicial: fromDate,
        data_final: toDate,
        offset_val: offset,
        limit_val: pageSize
      });

    if (error) throw error;
    
    return {
      orders: orders || [],
      totalCount: orders?.[0]?.total_count || 0,
      currentPage: page,
      pageSize
    };
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    throw error;
  }
};

export const fetchAllJabOrders = async (options: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>) => {
  const fromDate = options.dateRange?.from?.toISOString() || '';
  const toDate = options.dateRange?.to?.toISOString() || '';

  try {
    const { data: rawOrders, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select('*')
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .gte('DATA_PEDIDO', fromDate)
      .lte('DATA_PEDIDO', toDate);

    if (error) throw error;
    
    // Transform raw data to match JabOrder type
    const orders = (rawOrders || []).map(order => {
      // Get items for this order (in a real implementation, you'd fetch these)
      const items = [];
      
      return {
        MATRIZ: order.MATRIZ,
        FILIAL: order.FILIAL,
        PED_NUMPEDIDO: order.PED_NUMPEDIDO,
        PED_ANOBASE: order.PED_ANOBASE,
        total_saldo: 0, // Calculate this from items
        valor_total: 0, // Calculate this from items
        APELIDO: null, // Populate if available
        PEDIDO_CLIENTE: order.PEDIDO_CLIENTE,
        STATUS: order.STATUS,
        REPRESENTANTE_NOME: null, // Populate if available
        PES_CODIGO: order.PES_CODIGO,
        items: items
      };
    });

    return { 
      orders: orders,
      totalCount: orders.length || 0,
      itensSeparacao: {}
    };
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw error;
  }
};
