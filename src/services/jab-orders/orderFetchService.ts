
import { supabase } from "@/integrations/supabase/client";
import { UseJabOrdersOptions } from "@/types/jabOrders";
import { clientCodeToString, clientCodeToNumber } from "@/utils/client-orders/clientUtils";

export const fetchOrdersForClients = async (clientIds: (string | number)[], fromDate: string, toDate: string) => {
  try {
    const clientIdsNumbers = clientIds.map(clientCodeToNumber);
    
    const { data, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select(`
        *,
        items:BLUEBAY_PEDIDO(*)
      `)
      .in('PES_CODIGO', clientIdsNumbers)
      .gte('DATA_PEDIDO', fromDate)
      .lte('DATA_PEDIDO', toDate);
      
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return { success: false, error };
  }
};

export const fetchAllJabOrders = async (options: Omit<UseJabOrdersOptions, 'page' | 'pageSize'>) => {
  const fromDate = options.dateRange?.from?.toISOString() || '';
  const toDate = options.dateRange?.to?.toISOString() || '';

  try {
    // First, get the orders with their items
    const { data: orders, error } = await supabase
      .from('BLUEBAY_PEDIDO')
      .select(`
        *,
        items:BLUEBAY_PEDIDO(*)
      `)
      .eq('CENTROCUSTO', 'JAB')
      .in('STATUS', ['1', '2'])
      .gte('DATA_PEDIDO', fromDate)
      .lte('DATA_PEDIDO', toDate);

    if (error) throw error;
    if (!orders) return { orders: [], totalCount: 0 };

    // Get client info
    const clientCodes = Array.from(new Set(orders.map(order => order.PES_CODIGO).filter(Boolean)));
    const clientCodesNumbers = clientCodes.map(clientCodeToNumber);
    
    const { data: clients, error: clientsError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO')
      .in('PES_CODIGO', clientCodesNumbers);

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
    }

    // Get representatives info
    const repCodes = Array.from(new Set(orders.map(order => order.REPRESENTANTE).filter(Boolean)));
    const repCodesNumbers = repCodes.map(clientCodeToNumber);
    
    const { data: reps, error: repsError } = await supabase
      .from('BLUEBAY_PESSOA')
      .select('PES_CODIGO, APELIDO')
      .in('PES_CODIGO', repCodesNumbers);

    if (repsError) {
      console.error('Error fetching representatives:', repsError);
    }

    // Process the orders
    const clientMap = clients ? clients.reduce((map: any, client: any) => {
      map[client.PES_CODIGO] = client;
      return map;
    }, {}) : {};

    const repMap = reps ? reps.reduce((map: any, rep: any) => {
      map[rep.PES_CODIGO] = rep;
      return map;
    }, {}) : {};

    const processedOrders = orders.map(order => {
      const client = clientMap[order.PES_CODIGO] || {};
      const rep = repMap[order.REPRESENTANTE] || {};

      const orderItems = order.items || [];
      const total_saldo = orderItems.reduce((acc: number, item: any) => 
        acc + (item.QTDE_SALDO || 0), 0);
        
      const valor_total = orderItems.reduce((acc: number, item: any) => 
        acc + ((item.QTDE_PEDIDA || 0) * (item.VALOR_UNITARIO || 0)), 0);

      return {
        ...order,
        APELIDO: client.APELIDO || null,
        REPRESENTANTE_NOME: rep.APELIDO || null,
        items: orderItems,
        total_saldo,
        valor_total
      };
    });

    return { 
      orders: processedOrders, 
      totalCount: processedOrders.length 
    };
  } catch (error) {
    console.error('Erro ao buscar todos os pedidos:', error);
    throw error;
  }
};
